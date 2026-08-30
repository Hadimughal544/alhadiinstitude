"use client";

import { useEffect, useState } from "react";
import {
  DAYS,
  dayOfWeekInTimezone,
  formatTimeRange,
  minutesOfDayInTimezone,
  type JoinRole,
} from "@/lib/timetable/time";
import type { TimetableLecture } from "@/lib/timetable/types";
import { buildTimeSlots, lectureGridSpan } from "@/lib/timetable/display";
import { LectureSessionCard } from "@/components/timetable/lecture-session-card";
import { Tabs } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

function NowLine({ timezone, startMin, endMin }: { timezone: string; startMin: number; endMin: number }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const minutes = minutesOfDayInTimezone(now, timezone);
  const total = endMin - startMin || 540;
  const top = ((minutes - startMin) / total) * 100;

  if (minutes < startMin || minutes > endMin) return null;

  return (
    <div
      className="pointer-events-none absolute left-0 right-0 z-10 flex items-center"
      style={{ top: `${Math.min(100, Math.max(0, top))}%` }}
    >
      <div className="h-0.5 flex-1 bg-destructive" />
      <span className="rounded bg-destructive px-1.5 py-0.5 text-[10px] font-medium text-white">
        Now
      </span>
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
  const { slots, startMin, endMin, stepMinutes } = buildTimeSlots(lectures, 60);
  const rowHeight = 56;

  if (lectures.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted">
        {emptyLabel}
      </p>
    );
  }

  return (
    <div className="hidden overflow-x-auto rounded-xl border border-border bg-card lg:block">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-border">
          <div className="p-3" />
          {DAYS.map((day, dayOfWeek) => (
            <div
              key={day}
              className={cn(
                "border-l border-border p-3 text-center",
                dayOfWeek === today && "bg-accent/50"
              )}
            >
              <p className="text-xs font-medium uppercase tracking-wide text-muted">{day.slice(0, 3)}</p>
              {dayOfWeek === today && (
                <span className="mt-1 inline-block rounded-full bg-teal px-2 py-0.5 text-[10px] font-medium text-cream dark:bg-gold dark:text-ink">
                  Today
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="relative grid grid-cols-[64px_repeat(7,1fr)]">
          <div>
            {slots.map((slot) => (
              <div
                key={slot}
                className="border-b border-border px-2 text-right text-[10px] text-muted"
                style={{ height: rowHeight }}
              >
                {slot}
              </div>
            ))}
          </div>
          {DAYS.map((day, dayOfWeek) => {
            const dayLectures = lectures.filter((l) => l.dayOfWeek === dayOfWeek);
            return (
              <div
                key={day}
                className={cn(
                  "relative border-l border-border",
                  dayOfWeek === today && "bg-accent/20"
                )}
                style={{ height: slots.length * rowHeight }}
              >
                {dayOfWeek === today && <NowLine timezone={tz} startMin={startMin} endMin={endMin} />}
                {dayLectures.map((lecture) => {
                  const { rowStart, rowSpan } = lectureGridSpan(lecture, startMin, stepMinutes);
                  return (
                    <div
                      key={lecture.id}
                      className="absolute left-1 right-1 z-[1]"
                      style={{
                        top: rowStart * rowHeight + 4,
                        height: rowSpan * rowHeight - 8,
                      }}
                    >
                      {onSelect ? (
                        <button
                          type="button"
                          onClick={() => onSelect(lecture)}
                          className="flex h-full w-full flex-col rounded-md border border-border bg-card p-2 text-left text-xs transition hover:border-teal/40 dark:hover:border-gold/40"
                        >
                          <span className="font-medium line-clamp-2">{lecture.title}</span>
                          <span className="mt-auto text-[10px] text-muted">
                            {formatTimeRange(lecture.startTime, lecture.endTime)}
                          </span>
                        </button>
                      ) : (
                        <div className="h-full overflow-hidden">
                          <LectureSessionCard
                            lecture={lecture}
                            showJoin={showJoin}
                            joinRole={joinRole}
                            variant="compact"
                            showTeacher={showTeacher}
                            showStudents={showStudents}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
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
          className="shrink-0 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted hover:bg-accent"
        >
          Today
        </button>
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
