"use client";

import type { JoinRole } from "@/lib/timetable/time";
import type { TimetableLecture } from "@/lib/timetable/types";
import { TimetableView } from "@/components/timetable/week-timetable";

/** Weekly timetable — desktop time grid + mobile day agenda */
export function WeekGrid({
  lectures,
  onSelect,
  showJoin,
  joinRole,
  emptyLabel = "No lectures scheduled.",
  timezone,
  showTeacher = true,
  showStudents = false,
}: {
  lectures: TimetableLecture[];
  onSelect?: (lecture: TimetableLecture) => void;
  showJoin?: boolean;
  joinRole?: JoinRole;
  emptyLabel?: string;
  timezone?: string;
  showTeacher?: boolean;
  showStudents?: boolean;
}) {
  return (
    <TimetableView
      lectures={lectures}
      timezone={timezone}
      onSelect={onSelect}
      showJoin={showJoin}
      joinRole={joinRole}
      emptyLabel={emptyLabel}
      showTeacher={showTeacher}
      showStudents={showStudents}
    />
  );
}
