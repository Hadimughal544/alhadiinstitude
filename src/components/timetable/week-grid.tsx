"use client";

import { DAYS, formatTimeRange, type JoinRole } from "@/lib/timetable/time";
import type { TimetableLecture } from "@/lib/timetable/types";
import { JoinClassButton } from "@/components/timetable/join-class-button";
import { cn } from "@/lib/utils";

export function WeekGrid({
  lectures,
  onSelect,
  showJoin,
  joinRole,
  emptyLabel = "No lectures scheduled.",
}: {
  lectures: TimetableLecture[];
  onSelect?: (lecture: TimetableLecture) => void;
  showJoin?: boolean;
  joinRole?: JoinRole;
  emptyLabel?: string;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
      {DAYS.map((day, dayOfWeek) => {
        const items = lectures
          .filter((lecture) => lecture.dayOfWeek === dayOfWeek)
          .slice()
          .sort((a, b) => a.startTime.localeCompare(b.startTime));

        return (
          <section
            key={day}
            className="rounded-2xl border border-foreground/10 bg-card p-3 shadow-sm"
          >
            <h3 className="border-b border-foreground/10 pb-2 text-sm font-semibold">{day}</h3>
            <div className="mt-3 space-y-2">
              {items.length === 0 && (
                <p className="py-6 text-center text-xs text-muted">{emptyLabel}</p>
              )}
              {items.map((lecture) => {
                const Card = onSelect ? "button" : "div";
                return (
                  <Card
                    key={lecture.id}
                    type={onSelect ? "button" : undefined}
                    onClick={onSelect ? () => onSelect(lecture) : undefined}
                    className={cn(
                      "w-full rounded-xl border border-foreground/10 bg-background p-3 text-left",
                      onSelect && "transition hover:border-gold/40"
                    )}
                  >
                    <p className="text-xs font-medium text-teal dark:text-gold">
                      {formatTimeRange(lecture.startTime, lecture.endTime)}
                    </p>
                    <p className="mt-1 text-sm font-semibold">{lecture.title}</p>
                    <p className="mt-1 text-xs text-muted">{lecture.teacherName}</p>
                    {lecture.studentNames.length > 0 && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted">
                        {lecture.studentNames.join(", ")}
                      </p>
                    )}
                    {showJoin && joinRole && (
                      <div className="mt-3" onClick={(event) => event.stopPropagation()}>
                        <JoinClassButton
                          meetUrl={lecture.meetUrl}
                          lecture={lecture}
                          role={joinRole}
                          className="w-full"
                        />
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
