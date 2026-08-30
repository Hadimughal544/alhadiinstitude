"use client";

import { formatTimeRange, type JoinRole } from "@/lib/timetable/time";
import type { TimetableLecture } from "@/lib/timetable/types";
import { serviceAccent } from "@/lib/timetable/display";
import { JoinClassButton } from "@/components/timetable/join-class-button";
import { cn } from "@/lib/utils";

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
            : cn("border-border bg-card p-3 hover:border-teal/30 dark:hover:border-gold/30", accent.className),
        onSelect && "cursor-pointer hover:bg-accent/30"
      )}
      style={variant !== "hero" ? accent.style : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "font-medium",
              variant === "hero" ? "font-display text-lg" : "text-sm"
            )}
          >
            {lecture.title}
          </p>
          <p
            className={cn(
              "mt-0.5 font-medium text-teal dark:text-gold",
              variant === "hero" ? "text-base" : "text-xs"
            )}
          >
            {formatTimeRange(lecture.startTime, lecture.endTime)}
          </p>
          {showTeacher && (
            <p className="mt-1 truncate text-xs text-muted">{lecture.teacherName}</p>
          )}
          {showStudents && lecture.studentNames.length > 0 && (
            <p className="mt-1 line-clamp-2 text-xs text-muted">
              {lecture.studentNames.join(", ")}
            </p>
          )}
          {lecture.serviceTitle && variant !== "compact" && (
            <p className="mt-1 text-xs text-muted">{lecture.serviceTitle}</p>
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
