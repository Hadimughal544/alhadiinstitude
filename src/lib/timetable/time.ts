import { DEFAULT_TIMEZONE } from "@/lib/country-timezones";

export { DEFAULT_TIMEZONE };

export const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function normalizeTime(value: string) {
  const match = value.trim().match(/^(\d{1,2}):([0-5]\d)/);
  if (!match) return value.trim();
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

export function isValidTime(value: string) {
  return TIME_RE.test(normalizeTime(value));
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function rangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
) {
  return timeToMinutes(aStart) < timeToMinutes(bEnd) && timeToMinutes(bStart) < timeToMinutes(aEnd);
}

export function formatTimeRange(startTime: string, endTime: string) {
  return `${startTime} – ${endTime}`;
}

const WEEKDAY_SHORT: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export function dayOfWeekInTimezone(date: Date, timezone: string): number {
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: timezone,
  }).format(date);
  return WEEKDAY_SHORT[weekday] ?? date.getDay();
}

function zonedParts(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value || "0";
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

/** Convert a wall-clock date+time in a timezone to a real Date. */
export function wallTimeInZoneToDate(ymd: string, hm: string, timeZone: string): Date {
  const [year, month, day] = ymd.split("-").map(Number);
  const [hour, minute] = hm.split(":").map(Number);
  let utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);

  for (let i = 0; i < 24; i += 1) {
    const got = zonedParts(new Date(utcGuess), timeZone);
    const wanted = Date.UTC(year, month - 1, day, hour, minute);
    const actual = Date.UTC(got.year, got.month - 1, got.day, got.hour, got.minute);
    const diff = wanted - actual;
    if (diff === 0) return new Date(utcGuess);
    utcGuess += diff;
  }

  return new Date(utcGuess);
}

function ymdInTimezone(date: Date, timezone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function addCalendarDays(ymd: string, days: number) {
  const [year, month, day] = ymd.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0)).toISOString().slice(0, 10);
}

/** Next date (YYYY-MM-DD) for a weekday in the given timezone, including today. */
export function nextDateForWeekday(
  dayOfWeek: number,
  timezone: string,
  from = new Date()
): string {
  let ymd = ymdInTimezone(from, timezone);
  for (let i = 0; i < 7; i += 1) {
    const noon = wallTimeInZoneToDate(ymd, "12:00", timezone);
    if (dayOfWeekInTimezone(noon, timezone) === dayOfWeek) return ymd;
    ymd = addCalendarDays(ymd, 1);
  }
  throw new Error("Could not resolve the next class date.");
}

export function formatHm(date: Date, timezone: string) {
  const parts = zonedParts(date, timezone);
  return `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
}

export function timezoneShortName(timezone: string, at = new Date()) {
  const name = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    timeZoneName: "short",
  })
    .formatToParts(at)
    .find((part) => part.type === "timeZoneName")?.value;
  return name || timezone;
}

export type SourceSlot = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
};

export function lectureOccurrence(slot: SourceSlot, now = new Date()) {
  const timezone = slot.timezone || DEFAULT_TIMEZONE;
  const dateStr = nextDateForWeekday(slot.dayOfWeek, timezone, now);
  return {
    start: wallTimeInZoneToDate(dateStr, slot.startTime, timezone),
    end: wallTimeInZoneToDate(dateStr, slot.endTime, timezone),
  };
}

export function timesInPakistanLabel() {
  return "Times in Pakistan (PKT)";
}

export function timesInZoneLabel(timezone: string) {
  const city = timezone.split("/").pop()?.replaceAll("_", " ") || timezone;
  return `Times in ${city} (${timezoneShortName(timezone)})`;
}

export function projectSlot(slot: SourceSlot, viewerTimezone: string, now = new Date()) {
  const sourceTz = slot.timezone || DEFAULT_TIMEZONE;
  const dateStr = nextDateForWeekday(slot.dayOfWeek, sourceTz, now);
  const start = wallTimeInZoneToDate(dateStr, slot.startTime, sourceTz);
  const end = wallTimeInZoneToDate(dateStr, slot.endTime, sourceTz);
  return {
    dayOfWeek: dayOfWeekInTimezone(start, viewerTimezone),
    startTime: formatHm(start, viewerTimezone),
    endTime: formatHm(end, viewerTimezone),
  };
}

export function lectureSourceSlot(lecture: {
  sourceDayOfWeek: number;
  sourceStartTime: string;
  sourceEndTime: string;
  sourceTimezone: string;
}): SourceSlot {
  return {
    dayOfWeek: lecture.sourceDayOfWeek,
    startTime: lecture.sourceStartTime,
    endTime: lecture.sourceEndTime,
    timezone: lecture.sourceTimezone || DEFAULT_TIMEZONE,
  };
}

export function withViewerTimes<
  T extends {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    timezone: string;
    sourceDayOfWeek: number;
    sourceStartTime: string;
    sourceEndTime: string;
    sourceTimezone: string;
  },
>(lectures: T[], viewerTimezone: string, now = new Date()): T[] {
  return lectures.map((lecture) => {
    const projected = projectSlot(lectureSourceSlot(lecture), viewerTimezone, now);
    return {
      ...lecture,
      dayOfWeek: projected.dayOfWeek,
      startTime: projected.startTime,
      endTime: projected.endTime,
      timezone: viewerTimezone,
    };
  });
}

export function compareLectureTime(a: { startTime: string }, b: { startTime: string }) {
  return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
}

/** Minutes before class start that the Join button appears (for everyone). */
export const JOIN_MINUTES_BEFORE = 5;

/**
 * When false, the Join button shows any time before the class ends (the Meet room
 * is open anyway). When true (default), it only shows within the window below.
 */
export const JOIN_REQUIRE_WINDOW = process.env.JOIN_REQUIRE_WINDOW !== "false";

export type JoinRole = "teacher" | "student" | "admin";
export type JoinWindowState = "waiting" | "open" | "ended";

export function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function minutesOfDayInTimezone(date: Date, timezone: string): number {
  const parts = zonedParts(date, timezone);
  return parts.hour * 60 + parts.minute;
}

export function joinWindow(
  lecture: SourceSlot,
  _role: JoinRole,
  now = new Date(),
  viewerTimezone = lecture.timezone || DEFAULT_TIMEZONE
): { state: JoinWindowState; opensAt: string } {
  const { start, end } = lectureOccurrence(lecture, now);
  const openAt = new Date(start.getTime() - JOIN_MINUTES_BEFORE * 60 * 1000);
  const opensAt = formatHm(openAt, viewerTimezone);

  if (now.getTime() >= end.getTime()) return { state: "ended", opensAt };
  if (!JOIN_REQUIRE_WINDOW) return { state: "open", opensAt };
  if (now.getTime() >= openAt.getTime()) return { state: "open", opensAt };
  return { state: "waiting", opensAt };
}
