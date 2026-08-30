"use client";

import { useEffect, useState } from "react";
import { Video } from "lucide-react";
import { joinWindow, lectureSourceSlot, type JoinRole } from "@/lib/timetable/time";
import { Badge } from "@/components/ui/badge";
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
  compact,
}: {
  meetUrl: string | null;
  lecture: LectureWindow;
  role: JoinRole;
  className?: string;
  compact?: boolean;
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);

  const windowState = joinWindow(lectureSourceSlot(lecture), role, now, lecture.timezone);

  if (windowState.state === "open") {
    if (!meetUrl) {
      return <span className={cn("text-xs text-muted", className)}>Link not ready</span>;
    }

    return (
      <a
        href={meetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-full bg-teal text-cream shadow-sm transition hover:bg-teal-light dark:bg-gold dark:text-ink",
          compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
          className
        )}
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cream/60 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-cream dark:bg-ink" />
        </span>
        {!compact && <Video className="h-4 w-4" />}
        {compact ? "Join" : "Join class"}
      </a>
    );
  }

  if (windowState.state === "ended") {
    return (
      <Badge variant="outline" className={className}>
        Ended
      </Badge>
    );
  }

  return (
    <span className={cn("text-xs text-muted", className)}>
      Opens {windowState.opensAt}
    </span>
  );
}
