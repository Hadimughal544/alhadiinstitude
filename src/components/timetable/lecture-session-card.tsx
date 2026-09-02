"use client";

import { formatTimeRange, timeToMinutes, type JoinRole } from "@/lib/timetable/time";
import type { TimetableLecture } from "@/lib/timetable/types";
import { serviceAccent, serviceHue } from "@/lib/timetable/display";
import { JoinClassButton } from "@/components/timetable/join-class-button";
import { cn } from "@/lib/utils";

function formatDuration(startTime: string, endTime: string) {
  const minutes = Math.max(0, timeToMinutes(endTime) - timeToMinutes(startTime));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}m`;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

export function LectureSessionCard({
  lecture,
  showJoin,
  joinRole,
  onSelect,
  variant = "default",
  showTeacher = true,
  showStudents = false,
}: {
  lecture: TimetableLecture;
  showJoin?: boolean;
  joinRole?: JoinRole;
  onSelect?: (lecture: TimetableLecture) => void;
  variant?: "default" | "compact" | "hero";
  showTeacher?: boolean;
  showStudents?: boolean;
}) {
  const accent = serviceAccent(lecture.serviceId);
  const Wrapper = onSelect ? "button" : "div";

  return (
    <Wrapper
      type={onSelect ? "button" : undefined}
      onClick={onSelect ? () => onSelect(lecture) : undefined}
      className={cn(
        "w-full rounded-lg border text-left transition",
        variant === "hero"
          ? "border-teal/20 bg-card p-5 shadow-[var(--shadow-card)] dark:border-gold/20"
          : variant === "compact"
            ? "border-border bg-card p-2.5"
            : cn("border-border bg-card p-3.5 hover:shadow-[var(--shadow-card)]", accent.className),
        onSelect && "cursor-pointer hover:bg-accent/30"
      )}
      style={variant !== "hero" ? accent.style : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate font-semibold",
              variant === "hero" ? "font-display text-lg" : "text-sm"
            )}
          >
            {lecture.title}
          </p>
          <p
            className={cn(
              "mt-1 flex flex-wrap items-center gap-x-2 font-medium tabular-nums text-teal dark:text-gold",
              variant === "hero" ? "text-base" : "text-xs"
            )}
          >
            {formatTimeRange(lecture.startTime, lecture.endTime)}
            <span className="font-normal text-muted">
              {formatDuration(lecture.startTime, lecture.endTime)}
            </span>
          </p>
          {(showTeacher || (showStudents && lecture.studentNames.length > 0)) && (
            <p className="mt-1.5 line-clamp-2 text-xs text-muted">
              {showStudents && lecture.studentNames.length > 0
                ? lecture.studentNames.join(", ")
                : lecture.teacherName}
            </p>
          )}
          {lecture.serviceTitle && variant !== "compact" && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: `hsl(${serviceHue(lecture.serviceId) ?? 200} 55% 45%)` }}
              />
              {lecture.serviceTitle}
            </p>
          )}
        </div>
        {showJoin && joinRole && (
          <JoinClassButton
            meetUrl={lecture.meetUrl}
            lecture={lecture}
            role={joinRole}
            compact={variant === "compact"}
          />
        )}
      </div>
    </Wrapper>
  );
}
