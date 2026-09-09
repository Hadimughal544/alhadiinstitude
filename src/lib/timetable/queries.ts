import "server-only";

import { prisma } from "@/lib/prisma";
import { DEFAULT_TIMEZONE, timezoneForCountryCode } from "@/lib/country-timezones";
import { compareLectureTime, dayOfWeekInTimezone, withViewerTimes } from "@/lib/timetable/time";
import type { TimetableLecture } from "@/lib/timetable/types";

const lectureInclude = {
  teacher: { include: { user: { select: { name: true, email: true } } } },
  service: { select: { id: true, title: true } },
  enrollments: {
    include: {
      student: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  },
} as const;

type LectureRecord = Awaited<ReturnType<typeof prisma.lecture.findMany<{ include: typeof lectureInclude }>>>[number];

export function toTimetableLecture(lecture: LectureRecord): TimetableLecture {
  return {
    id: lecture.id,
    title: lecture.title,
    dayOfWeek: lecture.dayOfWeek,
    startTime: lecture.startTime,
    endTime: lecture.endTime,
    timezone: DEFAULT_TIMEZONE,
    sourceDayOfWeek: lecture.dayOfWeek,
    sourceStartTime: lecture.startTime,
    sourceEndTime: lecture.endTime,
    sourceTimezone: DEFAULT_TIMEZONE,
    meetUrl: lecture.meetUrl,
    teacherName: lecture.teacher.user.name || lecture.teacher.user.email,
    teacherId: lecture.teacherId,
    studentNames: lecture.enrollments.map(
      (row) => row.student.user.name || row.student.user.email
    ),
    studentIds: lecture.enrollments.map((row) => row.studentId),
    serviceId: lecture.serviceId,
    serviceTitle: lecture.service?.title ?? null,
    active: lecture.active,
  };
}

export async function getInstituteTimezone() {
  return DEFAULT_TIMEZONE;
}

export async function getStudentViewerTimezone(userId: string) {
  const student = await prisma.studentProfile.findUnique({
    where: { userId },
    include: { country: { select: { timezone: true, name: true } } },
  });
  const timezone =
    student?.country?.timezone || timezoneForCountryCode(student?.countryCode) || DEFAULT_TIMEZONE;
  return {
    timezone,
    countryName: student?.country?.name ?? null,
  };
}

export async function getTeacherViewerTimezone(userId: string) {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { userId },
    include: { country: { select: { timezone: true, name: true } } },
  });
  const timezone =
    teacher?.country?.timezone || timezoneForCountryCode(teacher?.countryCode) || DEFAULT_TIMEZONE;
  return {
    timezone,
    countryName: teacher?.country?.name ?? null,
  };
}

export async function getAllLectures() {
  const lectures = await prisma.lecture.findMany({
    where: { active: true },
    include: lectureInclude,
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
  return lectures.map(toTimetableLecture);
}

export async function getLecturesForTeacher(userId: string) {
  const lectures = await prisma.lecture.findMany({
    where: { active: true, teacher: { userId } },
    include: lectureInclude,
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
  return lectures.map(toTimetableLecture);
}

export async function getLecturesForStudent(userId: string) {
  const lectures = await prisma.lecture.findMany({
    where: { active: true, enrollments: { some: { student: { userId } } } },
    include: lectureInclude,
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
  return lectures.map(toTimetableLecture);
}

export async function getStudentSchedule(userId: string) {
  const viewer = await getStudentViewerTimezone(userId);
  const sourceLectures = await getLecturesForStudent(userId);
  return {
    timezone: viewer.timezone,
    countryName: viewer.countryName,
    lectures: withViewerTimes(sourceLectures, viewer.timezone),
  };
}

export async function getTeacherSchedule(userId: string) {
  const viewer = await getTeacherViewerTimezone(userId);
  const sourceLectures = await getLecturesForTeacher(userId);
  return {
    timezone: viewer.timezone,
    countryName: viewer.countryName,
    lectures: withViewerTimes(sourceLectures, viewer.timezone),
  };
}

export function todaysLectures(lectures: TimetableLecture[], timezone: string) {
  const today = dayOfWeekInTimezone(new Date(), timezone);
  return lectures
    .filter((lecture) => lecture.dayOfWeek === today)
    .sort(compareLectureTime);
}

export async function listActiveTeachers() {
  return prisma.teacherProfile.findMany({
    where: { user: { active: true } },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
    orderBy: { user: { name: "asc" } },
  });
}

export async function listActiveStudents() {
  return prisma.studentProfile.findMany({
    where: { user: { active: true } },
    include: { user: { select: { id: true, name: true, email: true, phone: true } } },
    orderBy: { user: { name: "asc" } },
  });
}
