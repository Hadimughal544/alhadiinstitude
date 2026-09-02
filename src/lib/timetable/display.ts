import type { TimetableLecture } from "@/lib/timetable/types";
import { compareLectureTime, joinWindow, lectureSourceSlot, timeToMinutes, type JoinRole } from "@/lib/timetable/time";

const SERVICE_HUES = [168, 200, 220, 260, 300, 340, 25, 45];

/** Stable hue for a service, so the same course always reads the same colour. */
export function serviceHue(serviceId: string | null): number | null {
  if (!serviceId) return null;
  let hash = 0;
  for (let i = 0; i < serviceId.length; i += 1) {
    hash = serviceId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return SERVICE_HUES[Math.abs(hash) % SERVICE_HUES.length];
}

/**
 * Accent for a lecture card. Colours are mixed into the current theme's card
 * and border tokens, so they stay legible in both light and dark mode.
 */
export function serviceAccent(serviceId: string | null): {
  style?: React.CSSProperties;
  className: string;
} {
  const hue = serviceHue(serviceId);
  if (hue === null) {
    return { className: "border-border bg-card border-l-[3px]" };
  }
  const base = `hsl(${hue} 55% 45%)`;
  return {
    className: "border-l-[3px]",
    style: {
      backgroundColor: `color-mix(in oklab, ${base} 7%, var(--card))`,
      borderColor: `color-mix(in oklab, ${base} 28%, var(--border))`,
      borderLeftColor: base,
    },
  };
}

/**
 * Lays overlapping lectures of a single day side by side instead of stacking
 * them on top of each other. Returns the column index / count for each lecture.
 */
export function layoutDayLectures(lectures: TimetableLecture[]) {
  const sorted = [...lectures].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );
  const placed: { lecture: TimetableLecture; column: number; columns: number }[] = [];
  let cluster: typeof placed = [];
  let clusterEnd = -1;

  const flush = () => {
    const columns = cluster.reduce((max, item) => Math.max(max, item.column + 1), 1);
    for (const item of cluster) item.columns = columns;
    cluster = [];
  };

  for (const lecture of sorted) {
    const start = timeToMinutes(lecture.startTime);
    const end = timeToMinutes(lecture.endTime);
    if (cluster.length > 0 && start >= clusterEnd) flush();

    const taken = new Set(
      cluster
        .filter((item) => timeToMinutes(item.lecture.endTime) > start)
        .map((item) => item.column)
    );
    let column = 0;
    while (taken.has(column)) column += 1;

    const item = { lecture, column, columns: 1 };
    cluster.push(item);
    placed.push(item);
    clusterEnd = Math.max(clusterEnd, end);
  }
  flush();

  return placed;
}

export function buildTimeSlots(lectures: TimetableLecture[], stepMinutes = 60) {
  if (lectures.length === 0) {
    return { slots: ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"], startMin: 8 * 60, endMin: 17 * 60, stepMinutes };
  }
  let min = Infinity;
  let max = -Infinity;
  for (const lecture of lectures) {
    min = Math.min(min, timeToMinutes(lecture.startTime));
    max = Math.max(max, timeToMinutes(lecture.endTime));
  }
  const startMin = Math.floor(min / stepMinutes) * stepMinutes;
  const endMin = Math.ceil(max / stepMinutes) * stepMinutes;
  const slots: string[] = [];
  for (let m = startMin; m <= endMin; m += stepMinutes) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`);
  }
  return { slots, startMin, endMin, stepMinutes };
}

/**
 * Position of a lecture on the hour grid, in (fractional) rows. The span follows
 * the real duration — a 30 minute class must not occupy a whole hour, or it would
 * bleed into the block below it.
 */
export function lectureGridSpan(lecture: TimetableLecture, startMin: number, stepMinutes: number) {
  const lectureStart = timeToMinutes(lecture.startTime);
  const lectureEnd = timeToMinutes(lecture.endTime);
  const rowStart = Math.max(0, (lectureStart - startMin) / stepMinutes);
  const rowSpan = Math.max(0.25, (lectureEnd - lectureStart) / stepMinutes);
  return { rowStart, rowSpan };
}

export function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function pickNextLecture(lectures: TimetableLecture[], role: JoinRole) {
  const sorted = [...lectures].sort(compareLectureTime);
  for (const lecture of sorted) {
    const state = joinWindow(lectureSourceSlot(lecture), role, new Date(), lecture.timezone);
    if (state.state !== "ended") return lecture;
  }
  return sorted[0] ?? null;
}
