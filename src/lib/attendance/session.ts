import "server-only";

import { prisma } from "@/lib/prisma";
import { lectureOccurrence, lectureSourceSlot } from "@/lib/timetable/time";

export async function resolveOrCreateSession(lectureId: string, now = new Date()) {
  const lecture = await prisma.lecture.findUniqueOrThrow({
    where: { id: lectureId },
    select: { dayOfWeek: true, startTime: true, endTime: true, timezone: true },
  });

  const slot = lectureSourceSlot({
    sourceDayOfWeek: lecture.dayOfWeek,
    sourceStartTime: lecture.startTime,
    sourceEndTime: lecture.endTime,
    sourceTimezone: lecture.timezone,
  });
  const { start, end } = lectureOccurrence(slot, now);
  const occurredOn = new Intl.DateTimeFormat("en-CA", {
    timeZone: slot.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(start);

  return prisma.lectureSession.upsert({
    where: { lectureId_occurredOn: { lectureId, occurredOn } },
    create: {
      lectureId,
      occurredOn,
      scheduledStart: start,
      scheduledEnd: end,
    },
    update: {},
  });
}
