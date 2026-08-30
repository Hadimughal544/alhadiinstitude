import { formatTimeRange } from "@/lib/timetable/time";
import type { TimetableLecture } from "@/lib/timetable/types";
import { JoinClassButton } from "@/components/timetable/join-class-button";

export function TodayLectures({
  lectures,
  perspective,
}: {
  lectures: TimetableLecture[];
  perspective: "teacher" | "student";
}) {
  if (lectures.length === 0) {
    return (
      <div className="rounded-2xl border border-foreground/10 bg-card p-6 text-sm text-muted">
        No classes scheduled for today.
      </div>
    );
  }

  return (
    <ul className="grid gap-3">
      {lectures.map((lecture) => (
        <li
          key={lecture.id}
          className="flex flex-col gap-3 rounded-2xl border border-foreground/10 bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-xs font-medium text-teal dark:text-gold">
              {formatTimeRange(lecture.startTime, lecture.endTime)}
            </p>
            <h3 className="mt-1 text-lg font-semibold">{lecture.title}</h3>
            <p className="mt-1 text-sm text-muted">
              {perspective === "teacher"
                ? lecture.studentNames.join(", ") || "No students assigned"
                : lecture.teacherName}
            </p>
            {lecture.serviceTitle && (
              <p className="mt-1 text-xs text-muted">{lecture.serviceTitle}</p>
            )}
          </div>
          <JoinClassButton
            meetUrl={lecture.meetUrl}
            lecture={lecture}
            role={perspective}
          />
        </li>
      ))}
    </ul>
  );
}
