"use client";

import { useEffect, useState } from "react";
import { Video } from "lucide-react";
import { joinWindow, lectureSourceSlot, type JoinRole } from "@/lib/timetable/time";
import { cn } from "@/lib/utils";

type LectureWindow = {
  timezone: string;
  sourceDayOfWeek: number;
  sourceStartTime: string;
  sourceEndTime: string;
  sourceTimezone: string;
};

export function JoinClassButton({
  meetUrl,
  lecture,
  role,
  className,
}: {
  meetUrl: string | null;
  lecture: LectureWindow;
  role: JoinRole;
  className?: string;
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);

  const windowState = joinWindow(lectureSourceSlot(lecture), role, now, lecture.timezone);

  if (windowState.state === "open") {
    if (!meetUrl) {
      return <span className={cn("text-sm text-muted", className)}>Link not ready</span>;
    }

    return (
      <a
        href={meetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full bg-teal px-4 py-2 text-sm font-medium text-cream shadow-md shadow-teal/20 transition hover:bg-teal-light dark:bg-gold dark:text-ink",
          className
        )}
      >
        <Video className="h-4 w-4" />
        Join class
      </a>
    );
  }

  if (windowState.state === "ended") {
    return <span className={cn("text-sm text-muted", className)}>Class ended</span>;
  }

  return (
    <span className={cn("text-sm text-muted", className)}>
      Link opens at {windowState.opensAt}
    </span>
  );
}
