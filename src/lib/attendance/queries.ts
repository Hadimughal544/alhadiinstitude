import "server-only";

import { prisma } from "@/lib/prisma";
import type { Role } from "@/generated/prisma/client";

export type SessionAttendanceRow = {
  sessionId: string;
  lectureId: string;
  lectureTitle: string;
  occurredOn: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  teacherName: string;
  teacherJoinedAt: Date | null;
  students: { id: string; name: string; joinedAt: Date | null }[];
};

export async function listSessionsWithAttendance(params: {
  from?: Date;
  to?: Date;
  teacherId?: string;
  lectureId?: string;
} = {}): Promise<SessionAttendanceRow[]> {
  const { from, to, teacherId, lectureId } = params;

  const sessions = await prisma.lectureSession.findMany({
    where: {
      lectureId: lectureId || undefined,
      lecture: teacherId ? { teacherId } : undefined,
      scheduledStart: {
        gte: from,
        lte: to,
      },
    },
    orderBy: { scheduledStart: "desc" },
    include: {
      lecture: {
        include: {
          teacher: { include: { user: { select: { name: true, email: true } } } },
          enrollments: {
            include: { student: { include: { user: { select: { id: true, name: true, email: true } } } } },
          },
        },
      },
      attendance: true,
    },
  });

  return sessions.map((session) => {
    const attendanceByUserId = new Map(session.attendance.map((record) => [record.userId, record]));
    return {
      sessionId: session.id,
      lectureId: session.lectureId,
      lectureTitle: session.lecture.title,
      occurredOn: session.occurredOn,
      scheduledStart: session.scheduledStart,
      scheduledEnd: session.scheduledEnd,
      teacherName: session.lecture.teacher.user.name || session.lecture.teacher.user.email,
      teacherJoinedAt: session.teacherJoinedAt,
      students: session.lecture.enrollments.map((enrollment) => ({
        id: enrollment.student.user.id,
        name: enrollment.student.user.name || enrollment.student.user.email,
        joinedAt: attendanceByUserId.get(enrollment.student.user.id)?.joinedAt ?? null,
      })),
    };
  });
}

export type AttendanceRecordRow = {
  id: string;
  personName: string;
  personEmail: string;
  role: Role;
  lectureTitle: string;
  occurredOn: string;
  joinedAt: Date;
};

/** One row per join-click event (teacher or student) — used by the admin attendance table. */
export async function listAttendanceRecords(): Promise<AttendanceRecordRow[]> {
  const records = await prisma.attendanceRecord.findMany({
    orderBy: { joinedAt: "desc" },
    take: 500,
    include: {
      user: { select: { name: true, email: true } },
      session: { include: { lecture: { select: { title: true } } } },
    },
  });

  return records.map((record) => ({
    id: record.id,
    personName: record.user.name || record.user.email,
    personEmail: record.user.email,
    role: record.role,
    lectureTitle: record.session.lecture.title,
    occurredOn: record.session.occurredOn,
    joinedAt: record.joinedAt,
  }));
}
