"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import { toActionError, type ActionResult } from "@/lib/action-result";
import { getMeetProviderForTeacher } from "@/lib/meet";
import { assertNoLectureOverlap } from "@/lib/timetable/overlap";
import { getInstituteTimezone } from "@/lib/timetable/queries";
import { isValidTime, normalizeTime } from "@/lib/timetable/time";

const lectureSchema = z.object({
  title: z.string().trim().min(2, "Title is required."),
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z.string().refine(isValidTime, "Start time must be HH:MM."),
  endTime: z.string().refine(isValidTime, "End time must be HH:MM."),
  teacherId: z.string().min(1, "Choose a teacher."),
  serviceId: z.string().optional().nullable(),
  studentIds: z.array(z.string()).min(1, "Assign at least one student."),
});

function revalidateLectures() {
  revalidatePath("/admin/timetable");
  revalidatePath("/teacher");
  revalidatePath("/teacher/timetable");
  revalidatePath("/student");
  revalidatePath("/student/timetable");
}

function parseStudentIds(formData: FormData) {
  return formData
    .getAll("studentIds")
    .map((value) => String(value).trim())
    .filter(Boolean);
}

async function getTeacherUserId(teacherProfileId: string) {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { id: teacherProfileId },
    include: { user: { select: { id: true, active: true } } },
  });
  if (!teacher || !teacher.user.active) {
    throw new Error("Teacher not found or inactive.");
  }
  return teacher.userId;
}

async function assertStudentsExist(studentIds: string[]) {
  const students = await prisma.studentProfile.findMany({
    where: { id: { in: studentIds } },
    include: { user: { select: { active: true } } },
  });
  if (students.length !== studentIds.length) {
    throw new Error("One or more students could not be found.");
  }
  if (students.some((student) => !student.user.active)) {
    throw new Error("One or more selected students are inactive.");
  }
}

export async function createLectureAction(formData: FormData): Promise<ActionResult> {
  let googleEventId: string | undefined;
  let teacherUserId: string | undefined;
  try {
    await requireAdmin();
    const parsed = lectureSchema.safeParse({
      title: formData.get("title"),
      dayOfWeek: formData.get("dayOfWeek"),
      startTime: normalizeTime(String(formData.get("startTime") || "")),
      endTime: normalizeTime(String(formData.get("endTime") || "")),
      teacherId: formData.get("teacherId"),
      serviceId: formData.get("serviceId") || null,
      studentIds: parseStudentIds(formData),
    });
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message || "Check the lecture fields." };
    }
    if (parsed.data.startTime >= parsed.data.endTime) {
      return { ok: false, error: "End time must be after start time." };
    }

    const timezone = await getInstituteTimezone();
    await assertNoLectureOverlap({
      dayOfWeek: parsed.data.dayOfWeek,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      teacherId: parsed.data.teacherId,
      studentIds: parsed.data.studentIds,
    });

    teacherUserId = await getTeacherUserId(parsed.data.teacherId);
    await assertStudentsExist(parsed.data.studentIds);

    const meet = await getMeetProviderForTeacher(teacherUserId);
    const event = await meet.createLectureEvent({
      title: parsed.data.title,
      dayOfWeek: parsed.data.dayOfWeek,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      timezone,
    });
    googleEventId = event.googleEventId;

    const lecture = await prisma.lecture.create({
      data: {
        title: parsed.data.title,
        dayOfWeek: parsed.data.dayOfWeek,
        startTime: parsed.data.startTime,
        endTime: parsed.data.endTime,
        timezone,
        teacherId: parsed.data.teacherId,
        serviceId: parsed.data.serviceId || null,
        meetUrl: event.meetUrl,
        googleEventId: event.googleEventId,
        enrollments: {
          create: parsed.data.studentIds.map((studentId) => ({ studentId })),
        },
      },
    });

    revalidateLectures();
    return { ok: true, id: lecture.id, message: "Lecture created with a Google Meet link." };
  } catch (error) {
    if (googleEventId && teacherUserId) {
      try {
        const meet = await getMeetProviderForTeacher(teacherUserId);
        await meet.deleteLectureEvent(googleEventId);
      } catch {
        // The Calendar event may remain on the teacher's calendar if the DB write failed.
      }
    }
    return { ok: false, error: toActionError(error, "Could not create the lecture.") };
  }
}

export async function updateLectureAction(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const id = String(formData.get("id") || "");
    const parsed = lectureSchema.safeParse({
      title: formData.get("title"),
      dayOfWeek: formData.get("dayOfWeek"),
      startTime: normalizeTime(String(formData.get("startTime") || "")),
      endTime: normalizeTime(String(formData.get("endTime") || "")),
      teacherId: formData.get("teacherId"),
      serviceId: formData.get("serviceId") || null,
      studentIds: parseStudentIds(formData),
    });
    if (!id || !parsed.success) {
      return { ok: false, error: parsed.success ? "Missing lecture id." : parsed.error.issues[0]?.message || "Check the lecture fields." };
    }
    if (parsed.data.startTime >= parsed.data.endTime) {
      return { ok: false, error: "End time must be after start time." };
    }

    const existing = await prisma.lecture.findUnique({ where: { id } });
    if (!existing) return { ok: false, error: "Lecture not found." };

    const timezone = await getInstituteTimezone();
    await assertNoLectureOverlap({
      dayOfWeek: parsed.data.dayOfWeek,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      teacherId: parsed.data.teacherId,
      studentIds: parsed.data.studentIds,
      excludeLectureId: id,
    });

    const teacherUserId = await getTeacherUserId(parsed.data.teacherId);
    await assertStudentsExist(parsed.data.studentIds);
    const meet = await getMeetProviderForTeacher(teacherUserId);

    let meetUrl = existing.meetUrl;
    let googleEventId = existing.googleEventId;
    const teacherChanged = existing.teacherId !== parsed.data.teacherId;

    if (teacherChanged && existing.googleEventId) {
      try {
        const previousTeacherUserId = await getTeacherUserId(existing.teacherId);
        const previousMeet = await getMeetProviderForTeacher(previousTeacherUserId);
        await previousMeet.deleteLectureEvent(existing.googleEventId);
      } catch {
        // Old host event can stay if that teacher disconnected Google.
      }
      const event = await meet.createLectureEvent({
        title: parsed.data.title,
        dayOfWeek: parsed.data.dayOfWeek,
        startTime: parsed.data.startTime,
        endTime: parsed.data.endTime,
        timezone,
      });
      meetUrl = event.meetUrl;
      googleEventId = event.googleEventId;
    } else if (existing.googleEventId) {
      const event = await meet.updateLectureEvent({
        googleEventId: existing.googleEventId,
        title: parsed.data.title,
        dayOfWeek: parsed.data.dayOfWeek,
        startTime: parsed.data.startTime,
        endTime: parsed.data.endTime,
        timezone,
      });
      meetUrl = event.meetUrl || existing.meetUrl;
      googleEventId = event.googleEventId;
    } else {
      const event = await meet.createLectureEvent({
        title: parsed.data.title,
        dayOfWeek: parsed.data.dayOfWeek,
        startTime: parsed.data.startTime,
        endTime: parsed.data.endTime,
        timezone,
      });
      meetUrl = event.meetUrl;
      googleEventId = event.googleEventId;
    }

    await prisma.$transaction([
      prisma.lectureEnrollment.deleteMany({ where: { lectureId: id } }),
      prisma.lecture.update({
        where: { id },
        data: {
          title: parsed.data.title,
          dayOfWeek: parsed.data.dayOfWeek,
          startTime: parsed.data.startTime,
          endTime: parsed.data.endTime,
          timezone,
          teacherId: parsed.data.teacherId,
          serviceId: parsed.data.serviceId || null,
          meetUrl,
          googleEventId,
          enrollments: {
            create: parsed.data.studentIds.map((studentId) => ({ studentId })),
          },
        },
      }),
    ]);

    revalidateLectures();
    return { ok: true, id, message: "Lecture updated." };
  } catch (error) {
    return { ok: false, error: toActionError(error, "Could not update the lecture.") };
  }
}

export async function deleteLectureAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const existing = await prisma.lecture.findUnique({
      where: { id },
      include: { teacher: { select: { userId: true } } },
    });
    if (!existing) return { ok: false, error: "Lecture not found." };

    if (existing.googleEventId) {
      try {
        const meet = await getMeetProviderForTeacher(existing.teacher.userId);
        await meet.deleteLectureEvent(existing.googleEventId);
      } catch {
        // Still remove the lecture if Google is disconnected or the event is already gone.
      }
    }

    await prisma.lecture.delete({ where: { id } });
    revalidateLectures();
    return { ok: true, message: "Lecture deleted." };
  } catch (error) {
    return { ok: false, error: toActionError(error, "Could not delete the lecture.") };
  }
}
