import type { TimetableLecture } from "@/lib/timetable/types";
import { compareLectureTime, joinWindow, lectureSourceSlot, timeToMinutes, type JoinRole } from "@/lib/timetable/time";

const SERVICE_HUES = [168, 200, 220, 260, 300, 340, 25, 45];

export function serviceAccent(serviceId: string | null): {
  style?: React.CSSProperties;
  className: string;
} {
  if (!serviceId) {
    return { className: "border-border bg-card" };
  }
  let hash = 0;
  for (let i = 0; i < serviceId.length; i += 1) {
    hash = serviceId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = SERVICE_HUES[Math.abs(hash) % SERVICE_HUES.length];
  return {
    className: "border-transparent",
    style: {
      backgroundColor: `hsl(${hue} 35% 92%)`,
      borderColor: `hsl(${hue} 40% 75%)`,
    },
  };
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

export function lectureGridSpan(lecture: TimetableLecture, startMin: number, stepMinutes: number) {
  const lectureStart = timeToMinutes(lecture.startTime);
  const lectureEnd = timeToMinutes(lecture.endTime);
  const rowStart = Math.max(0, (lectureStart - startMin) / stepMinutes);
  const rowSpan = Math.max(1, (lectureEnd - lectureStart) / stepMinutes);
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
