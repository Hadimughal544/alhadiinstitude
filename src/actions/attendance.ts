"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireSession } from "@/lib/auth-guards";
import { toActionError, type ActionResult } from "@/lib/action-result";
import { resolveOrCreateSession } from "@/lib/attendance/session";

export async function recordJoinClickAction(lectureId: string): Promise<ActionResult> {
  try {
    const authSession = await requireSession();
    const user = authSession.user;
    if (user.role !== "TEACHER" && user.role !== "STUDENT") {
      return { ok: false, error: "Only teachers and students can record attendance." };
    }

    const lecture = await prisma.lecture.findUnique({
      where: { id: lectureId },
      include: {
        teacher: { select: { userId: true } },
        enrollments: { include: { student: { select: { userId: true } } } },
      },
    });
    if (!lecture) return { ok: false, error: "Lecture not found." };

    const isTeacher = user.role === "TEACHER" && lecture.teacher.userId === user.id;
    const isEnrolledStudent =
      user.role === "STUDENT" &&
      lecture.enrollments.some((enrollment) => enrollment.student.userId === user.id);
    if (!isTeacher && !isEnrolledStudent) {
      return { ok: false, error: "You are not part of this lecture." };
    }

    const now = new Date();
    const session = await resolveOrCreateSession(lectureId, now);

    await prisma.attendanceRecord
      .create({
        data: {
          sessionId: session.id,
          userId: user.id,
          role: user.role,
          joinedAt: now,
        },
      })
      .catch(() => {
        // Unique [sessionId, userId] — already recorded, first click wins.
      });

    if (isTeacher && !session.teacherJoinedAt) {
      await prisma.lectureSession.update({
        where: { id: session.id },
        data: { teacherJoinedAt: now },
      });
    }

    revalidatePath("/admin/attendance");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: toActionError(error, "Could not record attendance.") };
  }
}

export async function deleteAttendanceRecordAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.attendanceRecord.delete({ where: { id } });
    revalidatePath("/admin/attendance");
    return { ok: true, message: "Attendance record deleted." };
  } catch (error) {
    return { ok: false, error: toActionError(error, "Could not delete the attendance record.") };
  }
}

export async function bulkDeleteAttendanceRecordsAction(ids: string[]): Promise<ActionResult> {
  try {
    await requireAdmin();
    if (ids.length === 0) return { ok: false, error: "No rows selected." };
    const { count } = await prisma.attendanceRecord.deleteMany({ where: { id: { in: ids } } });
    revalidatePath("/admin/attendance");
    return { ok: true, message: `${count} attendance records deleted.` };
  } catch (error) {
    return { ok: false, error: toActionError(error, "Could not delete the selected attendance records.") };
  }
}
