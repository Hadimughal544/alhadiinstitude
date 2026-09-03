"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import {
  DAYS,
  dayOfWeekInTimezone,
  formatTimeRange,
  minutesOfDayInTimezone,
  timeToMinutes,
  type JoinRole,
} from "@/lib/timetable/time";
import type { TimetableLecture } from "@/lib/timetable/types";
import {
  buildTimeSlots,
  layoutDayLectures,
  lectureGridSpan,
  serviceAccent,
  serviceHue,
} from "@/lib/timetable/display";
import { LectureSessionCard } from "@/components/timetable/lecture-session-card";
import { JoinClassButton } from "@/components/timetable/join-class-button";
import { Tabs } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const ROW_HEIGHT = 88;
const GRID_PAD = 10;
/** Space kept clear around every block so two classes never touch. */
const BLOCK_GAP = 6;
const MIN_BLOCK_HEIGHT = 20;

/** Minutes since midnight in the viewer's zone — null until mounted, so SSR stays stable. */
function useNowMinutes(timezone: string) {
  const [minutes, setMinutes] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setMinutes(minutesOfDayInTimezone(new Date(), timezone));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [timezone]);

  return minutes;
}

function formatDuration(startTime: string, endTime: string) {
  const minutes = Math.max(0, timeToMinutes(endTime) - timeToMinutes(startTime));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}m`;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

function NowLine({ nowMinutes, startMin, endMin }: { nowMinutes: number; startMin: number; endMin: number }) {
  if (nowMinutes < startMin || nowMinutes > endMin) return null;
  const top = GRID_PAD + ((nowMinutes - startMin) / 60) * ROW_HEIGHT;

  return (
    <div
      className="pointer-events-none absolute left-0 right-0 z-20 flex items-center"
      style={{ top }}
    >
      <span className="-ml-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
      <div className="h-px flex-1 bg-destructive/60" />
    </div>
  );
}

/** A single lecture rendered inside the week grid column. */
function WeekEventBlock({
  lecture,
  height,
  status,
  showJoin,
  joinRole,
  showTeacher,
  showStudents,
  onSelect,
}: {
  lecture: TimetableLecture;
  height: number;
  status: "idle" | "past" | "live" | "upcoming";
  showJoin?: boolean;
  joinRole?: JoinRole;
  showTeacher?: boolean;
  showStudents?: boolean;
  onSelect?: (lecture: TimetableLecture) => void;
}) {
  const accent = serviceAccent(lecture.serviceId);
  const people = showStudents
    ? lecture.studentNames.join(", ")
    : showTeacher
      ? lecture.teacherName
      : "";
  // Title and time are never sacrificed; extras only appear when they truly fit.
  const joinAs = height >= 78 && showJoin && joinRole ? joinRole : null;
  const roomForPeople = height >= 104 && people.length > 0;
  const compact = height < 70;
  // Only the very shortest lectures fall back to a one-line title + start time.
  const tiny = height < 34;

  return (
    <div className="group relative h-full w-full">
      <div
        title={`${lecture.title} · ${formatTimeRange(lecture.startTime, lecture.endTime)}`}
        className={cn(
          "flex h-full w-full flex-col overflow-hidden rounded-lg border text-left shadow-sm transition-all duration-150",
          "group-hover:-translate-y-px group-hover:shadow-md",
          tiny
            ? "justify-center px-2 py-0.5"
            : compact
              ? height < 48
                ? "px-2 py-0.5"
                : "px-2 py-1"
              : "px-2.5 py-2",
          accent.className,
          status === "past" && "opacity-55",
          status === "live" && "ring-2 ring-teal/45 dark:ring-gold/45"
        )}
        style={accent.style}
      >
        {tiny ? (
          <div className="flex shrink-0 items-baseline gap-1.5">
            <p className="min-w-0 flex-1 truncate text-[10px] font-semibold leading-none">
              {lecture.title}
            </p>
            <p className="shrink-0 text-[9.5px] font-medium leading-none tabular-nums text-teal dark:text-gold">
              {lecture.startTime}
            </p>
          </div>
        ) : (
          <>
            <div className="flex shrink-0 items-start gap-1.5">
              <p
                className={cn(
                  "min-w-0 flex-1 truncate font-semibold leading-tight",
                  compact ? "text-[10.5px]" : "text-[11.5px]"
                )}
              >
                {lecture.title}
              </p>
              {status === "live" && (
                <span className="relative mt-0.5 flex h-1.5 w-1.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal/70 dark:bg-gold/70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal dark:bg-gold" />
                </span>
              )}
            </div>
            <p
              className={cn(
                "shrink-0 truncate text-[10px] font-medium leading-tight tabular-nums text-teal dark:text-gold",
                compact ? "mt-0.5" : "mt-1"
              )}
            >
              {formatTimeRange(lecture.startTime, lecture.endTime)}
              {height >= 104 && (
                <span className="ml-1.5 font-normal text-muted">
                  {formatDuration(lecture.startTime, lecture.endTime)}
                </span>
              )}
            </p>
          </>
        )}
        {roomForPeople && (
          <p className="mt-1 min-h-0 truncate text-[10px] leading-tight text-muted">{people}</p>
        )}
        {joinAs && (
          <div className={cn("relative z-[2] mt-auto shrink-0", compact ? "pt-1" : "pt-1.5")}>
            <JoinClassButton meetUrl={lecture.meetUrl} lecture={lecture} role={joinAs} compact />
          </div>
        )}
      </div>

      {/* Click target for editing — sits under the Join link so both stay usable. */}
      {onSelect && (
        <button
          type="button"
          onClick={() => onSelect(lecture)}
          aria-label={`Edit ${lecture.title}`}
          className="absolute inset-0 z-[1] cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50 dark:focus-visible:ring-gold/50"
        />
      )}
    </div>
  );
}

function TimetableLegend({ lectures }: { lectures: TimetableLecture[] }) {
  const items = useMemo(() => {
    const map = new Map<string, string>();
    for (const lecture of lectures) {
      if (lecture.serviceId && lecture.serviceTitle) map.set(lecture.serviceId, lecture.serviceTitle);
    }
    return Array.from(map, ([id, title]) => ({ id, title, hue: serviceHue(id) }));
  }, [lectures]);

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {items.map((item) => (
        <span key={item.id} className="flex items-center gap-1.5 text-xs text-muted">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: `hsl(${item.hue ?? 200} 55% 45%)` }}
          />
          {item.title}
        </span>
      ))}
    </div>
  );
}

export function WeekTimetable({
  lectures,
  timezone,
  onSelect,
  showJoin,
  joinRole,
  showTeacher = true,
  showStudents = false,
  emptyLabel = "No lectures scheduled.",
}: {
  lectures: TimetableLecture[];
  timezone?: string;
  onSelect?: (lecture: TimetableLecture) => void;
  showJoin?: boolean;
  joinRole?: JoinRole;
  showTeacher?: boolean;
  showStudents?: boolean;
  emptyLabel?: string;
}) {
  const tz = timezone || lectures[0]?.timezone || "Asia/Karachi";
  const today = dayOfWeekInTimezone(new Date(), tz);
  const nowMinutes = useNowMinutes(tz);
  const { slots, startMin, endMin, stepMinutes } = buildTimeSlots(lectures, 60);
  const gridHeight = Math.max(1, slots.length - 1) * ROW_HEIGHT + GRID_PAD * 2;

  const weeklyMinutes = lectures.reduce(
    (total, lecture) => total + Math.max(0, timeToMinutes(lecture.endTime) - timeToMinutes(lecture.startTime)),
    0
  );
  const weeklyHours = Math.round((weeklyMinutes / 60) * 10) / 10;

  if (lectures.length === 0) {
    return (
      <div className="hidden flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16 text-center lg:flex">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <CalendarDays className="h-5 w-5" />
        </div>
        <p className="mt-3 text-sm font-medium">{emptyLabel}</p>
        <p className="mt-1 text-xs text-muted">Scheduled classes will appear on this grid.</p>
      </div>
    );
  }

  return (
    <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] lg:block">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-teal dark:text-gold" />
          <span className="text-sm font-semibold">Weekly schedule</span>
          <span className="text-xs text-muted">
            {lectures.length} {lectures.length === 1 ? "class" : "classes"} · {weeklyHours}h per week
          </span>
        </div>
        <TimetableLegend lectures={lectures} />
      </div>

      <div className="max-h-[74vh] overflow-auto">
        <div className="min-w-[900px]">
          {/* Day header */}
          <div className="sticky top-0 z-30 grid grid-cols-[76px_repeat(7,minmax(0,1fr))] border-b border-border bg-card">
            <div className="sticky left-0 z-40 flex items-end justify-end bg-card px-2 pb-2 pt-3 text-[10px] font-medium uppercase tracking-wider text-muted">
              Time
            </div>
            {DAYS.map((day, dayOfWeek) => {
              const isToday = dayOfWeek === today;
              const count = lectures.filter((l) => l.dayOfWeek === dayOfWeek).length;
              return (
                <div
                  key={day}
                  className={cn(
                    "relative border-l border-border px-2 py-3 text-center",
                    isToday && "bg-accent/40"
                  )}
                >
                  {isToday && (
                    <span className="absolute inset-x-0 top-0 h-0.5 bg-teal dark:bg-gold" />
                  )}
                  <p
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wider",
                      isToday ? "text-teal dark:text-gold" : "text-foreground/70"
                    )}
                  >
                    {day.slice(0, 3)}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted">
                    {isToday
                      ? "Today"
                      : count === 0
                        ? "—"
                        : `${count} ${count === 1 ? "class" : "classes"}`}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Time grid */}
          <div className="grid grid-cols-[76px_repeat(7,minmax(0,1fr))]">
            <div className="sticky left-0 z-20 bg-card" style={{ height: gridHeight }}>
              {slots.map((slot, i) => (
                <span
                  key={slot}
                  className="absolute right-2 -translate-y-1/2 text-[10px] font-medium tabular-nums text-muted"
                  style={{ top: i * ROW_HEIGHT + GRID_PAD }}
                >
                  {slot}
                </span>
              ))}
            </div>

            {DAYS.map((day, dayOfWeek) => {
              const isToday = dayOfWeek === today;
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              const placed = layoutDayLectures(lectures.filter((l) => l.dayOfWeek === dayOfWeek));
              return (
                <div
                  key={day}
                  className={cn(
                    "relative border-l border-border",
                    isWeekend && !isToday && "bg-foreground/[0.02]",
                    isToday && "bg-accent/15"
                  )}
                  style={{ height: gridHeight }}
                >
                  {/* Hour bands */}
                  {slots.slice(0, -1).map((slot, i) => (
                    <div
                      key={slot}
                      className={cn(
                        "absolute inset-x-0 border-t border-border/50",
                        i % 2 === 1 && "bg-foreground/[0.015]"
                      )}
                      style={{ top: i * ROW_HEIGHT + GRID_PAD, height: ROW_HEIGHT }}
                    />
                  ))}

                  {isToday && nowMinutes !== null && (
                    <NowLine nowMinutes={nowMinutes} startMin={startMin} endMin={endMin} />
                  )}

                  {placed.map(({ lecture, column, columns }) => {
                    const { rowStart, rowSpan } = lectureGridSpan(lecture, startMin, stepMinutes);
                    const height = Math.max(MIN_BLOCK_HEIGHT, rowSpan * ROW_HEIGHT - BLOCK_GAP);
                    // Side-by-side classes each keep their own column, with a gutter between.
                    const gutters = BLOCK_GAP * 2 + (columns - 1) * BLOCK_GAP;
                    const width = `calc((100% - ${gutters}px) / ${columns})`;
                    const start = timeToMinutes(lecture.startTime);
                    const end = timeToMinutes(lecture.endTime);
                    const status =
                      !isToday || nowMinutes === null
                        ? "idle"
                        : nowMinutes >= end
                          ? "past"
                          : nowMinutes >= start
                            ? "live"
                            : "upcoming";
                    return (
                      <div
                        key={lecture.id}
                        className="absolute z-[1]"
                        style={{
                          top: rowStart * ROW_HEIGHT + GRID_PAD + BLOCK_GAP / 2,
                          height,
                          left: `calc(${BLOCK_GAP}px + ${column} * (${width} + ${BLOCK_GAP}px))`,
                          width,
                        }}
                      >
                        <WeekEventBlock
                          lecture={lecture}
                          height={height}
                          status={status}
                          showJoin={showJoin}
                          joinRole={joinRole}
                          showTeacher={showTeacher}
                          showStudents={showStudents}
                          onSelect={onSelect}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DayAgenda({
  lectures,
  timezone,
  onSelect,
  showJoin,
  joinRole,
  showTeacher = true,
  showStudents = false,
  emptyLabel = "No lectures scheduled.",
}: {
  lectures: TimetableLecture[];
  timezone?: string;
  onSelect?: (lecture: TimetableLecture) => void;
  showJoin?: boolean;
  joinRole?: JoinRole;
  showTeacher?: boolean;
  showStudents?: boolean;
  emptyLabel?: string;
}) {
  const tz = timezone || lectures[0]?.timezone || "Asia/Karachi";
  const today = dayOfWeekInTimezone(new Date(), tz);
  const [selectedDay, setSelectedDay] = useState(String(today));

  const items = lectures
    .filter((l) => l.dayOfWeek === Number(selectedDay))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const tabItems = DAYS.map((day, i) => ({
    value: String(i),
    label: day.slice(0, 3),
  }));

  return (
    <div className="space-y-4 lg:hidden">
      <div className="flex items-center gap-2">
        <Tabs value={selectedDay} onChange={setSelectedDay} items={tabItems} className="flex-1" />
        <button
          type="button"
          onClick={() => setSelectedDay(String(today))}
          className="shrink-0 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted transition hover:bg-accent"
        >
          Today
        </button>
      </div>
      <div className="flex items-center justify-between px-1">
        <p className="text-sm font-medium">
          {DAYS[Number(selectedDay)]}
          {Number(selectedDay) === today && (
            <span className="ml-2 text-xs font-normal text-teal dark:text-gold">Today</span>
          )}
        </p>
        <p className="text-xs text-muted">
          {items.length === 0
            ? "No classes"
            : `${items.length} ${items.length === 1 ? "class" : "classes"}`}
        </p>
      </div>
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted">
            {emptyLabel}
          </p>
        ) : (
          items.map((lecture) => (
            <LectureSessionCard
              key={lecture.id}
              lecture={lecture}
              onSelect={onSelect}
              showJoin={showJoin}
              joinRole={joinRole}
              showTeacher={showTeacher}
              showStudents={showStudents}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function TimetableView(props: Parameters<typeof WeekTimetable>[0]) {
  return (
    <>
      <WeekTimetable {...props} />
      <DayAgenda {...props} />
    </>
  );
}
