"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";
import { toActionError, type ActionResult } from "@/lib/action-result";
import { getInstituteMeetProvider } from "@/lib/meet";
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

async function assertTeacherActive(teacherProfileId: string) {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { id: teacherProfileId },
    include: { user: { select: { active: true } } },
  });
  if (!teacher || !teacher.user.active) {
    throw new Error("Teacher not found or inactive.");
  }
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

function parseLectureForm(formData: FormData) {
  return lectureSchema.safeParse({
    title: formData.get("title"),
    dayOfWeek: formData.get("dayOfWeek"),
    startTime: normalizeTime(String(formData.get("startTime") || "")),
    endTime: normalizeTime(String(formData.get("endTime") || "")),
    teacherId: formData.get("teacherId"),
    serviceId: formData.get("serviceId") || null,
    studentIds: parseStudentIds(formData),
  });
}

export async function createLectureAction(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = parseLectureForm(formData);
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

    await assertTeacherActive(parsed.data.teacherId);
    await assertStudentsExist(parsed.data.studentIds);

    const meet = await getInstituteMeetProvider();
    const space = await meet.createOpenSpace();

    try {
      const lecture = await prisma.lecture.create({
        data: {
          title: parsed.data.title,
          dayOfWeek: parsed.data.dayOfWeek,
          startTime: parsed.data.startTime,
          endTime: parsed.data.endTime,
          timezone,
          teacherId: parsed.data.teacherId,
          serviceId: parsed.data.serviceId || null,
          meetUrl: space.meetUrl,
          meetSpaceId: space.spaceId,
          googleEventId: null,
          enrollments: {
            create: parsed.data.studentIds.map((studentId) => ({ studentId })),
          },
        },
      });

      revalidateLectures();
      return { ok: true, id: lecture.id, message: "Lecture created with an open Google Meet link." };
    } catch (dbError) {
      // A Meet space can't be deleted; ending any (unlikely) live call is the most
      // we can do. An orphaned, unused space is harmless.
      await meet.endActiveConference(space.spaceId).catch(() => {});
      throw dbError;
    }
  } catch (error) {
    return { ok: false, error: toActionError(error, "Could not create the lecture.") };
  }
}

export async function updateLectureAction(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const id = String(formData.get("id") || "");
    const parsed = parseLectureForm(formData);
    if (!id || !parsed.success) {
      return {
        ok: false,
        error: parsed.success
          ? "Missing lecture id."
          : parsed.error.issues[0]?.message || "Check the lecture fields.",
      };
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

    await assertTeacherActive(parsed.data.teacherId);
    await assertStudentsExist(parsed.data.studentIds);

    // The Meet link is institute-owned and teacher-agnostic, so it survives every
    // edit. Only legacy rows (created under the old per-teacher flow) need one.
    let meetUrl = existing.meetUrl;
    let meetSpaceId = existing.meetSpaceId;
    if (!meetSpaceId) {
      const meet = await getInstituteMeetProvider();
      const space = await meet.createOpenSpace();
      meetUrl = space.meetUrl;
      meetSpaceId = space.spaceId;
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
          meetSpaceId,
          googleEventId: null,
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

export async function regenerateLectureMeetAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const existing = await prisma.lecture.findUnique({ where: { id } });
    if (!existing) return { ok: false, error: "Lecture not found." };

    const meet = await getInstituteMeetProvider();
    const space = await meet.createOpenSpace();
    await prisma.lecture.update({
      where: { id },
      data: { meetUrl: space.meetUrl, meetSpaceId: space.spaceId, googleEventId: null },
    });

    if (existing.meetSpaceId && existing.meetSpaceId !== space.spaceId) {
      await meet.endActiveConference(existing.meetSpaceId).catch(() => {});
    }

    revalidateLectures();
    return { ok: true, id, message: "New Google Meet link generated." };
  } catch (error) {
    return { ok: false, error: toActionError(error, "Could not regenerate the Meet link.") };
  }
}

export async function deleteLectureAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const existing = await prisma.lecture.findUnique({ where: { id } });
    if (!existing) return { ok: false, error: "Lecture not found." };

    if (existing.meetSpaceId) {
      try {
        const meet = await getInstituteMeetProvider();
        await meet.endActiveConference(existing.meetSpaceId);
      } catch {
        // Spaces have no delete endpoint; a leftover space is harmless.
      }
    }

    await prisma.lecture.delete({ where: { id } });
    revalidateLectures();
    return { ok: true, message: "Lecture deleted." };
  } catch (error) {
    return { ok: false, error: toActionError(error, "Could not delete the lecture.") };
  }
}
