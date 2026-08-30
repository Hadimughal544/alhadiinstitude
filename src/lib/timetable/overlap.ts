import "server-only";

import { prisma } from "@/lib/prisma";
import { rangesOverlap } from "@/lib/timetable/time";

type OverlapInput = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  teacherId: string;
  studentIds: string[];
  excludeLectureId?: string;
};

export async function assertNoLectureOverlap({
  dayOfWeek,
  startTime,
  endTime,
  teacherId,
  studentIds,
  excludeLectureId,
}: OverlapInput) {
  const candidates = await prisma.lecture.findMany({
    where: {
      active: true,
      dayOfWeek,
      ...(excludeLectureId ? { NOT: { id: excludeLectureId } } : {}),
      OR: [
        { teacherId },
        studentIds.length
          ? { enrollments: { some: { studentId: { in: studentIds } } } }
          : undefined,
      ].filter(Boolean) as object[],
    },
    include: {
      teacher: { include: { user: { select: { name: true, email: true } } } },
      enrollments: {
        where: studentIds.length ? { studentId: { in: studentIds } } : undefined,
        include: { student: { include: { user: { select: { name: true, email: true } } } } },
      },
    },
  });

  for (const lecture of candidates) {
    if (!rangesOverlap(startTime, endTime, lecture.startTime, lecture.endTime)) {
      continue;
    }

    if (lecture.teacherId === teacherId) {
      const teacherName = lecture.teacher.user.name || lecture.teacher.user.email;
      throw new Error(
        `${teacherName} already has "${lecture.title}" at ${lecture.startTime}–${lecture.endTime} on this day.`
      );
    }

    const conflict = lecture.enrollments[0];
    if (conflict) {
      const studentName = conflict.student.user.name || conflict.student.user.email;
      throw new Error(
        `${studentName} is already enrolled in "${lecture.title}" at ${lecture.startTime}–${lecture.endTime} on this day.`
      );
    }
  }
}
