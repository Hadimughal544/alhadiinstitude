"use client";

import Link from "next/link";
import { CalendarDays, UserRound } from "lucide-react";
import { greetingForHour } from "@/lib/timetable/display";
import { LectureSessionCard } from "@/components/timetable/lecture-session-card";
import { JoinClassButton } from "@/components/timetable/join-class-button";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTimeRange } from "@/lib/timetable/time";
import type { TimetableLecture } from "@/lib/timetable/types";
import type { JoinRole } from "@/lib/timetable/time";

export function DashboardGreeting({ name, subtitle }: { name: string; subtitle?: string }) {
  const hour = new Date().getHours();
  return (
    <div className="mb-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        {greetingForHour(hour)}, {name}
      </h1>
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
    </div>
  );
}

export function NextClassHero({
  lecture,
  role,
  perspective,
}: {
  lecture: TimetableLecture | null;
  role: JoinRole;
  perspective: "teacher" | "student";
}) {
  if (!lecture) {
    return (
      <Card className="mb-6 border-dashed">
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted">No more classes scheduled for today.</p>
          <Link
            href={perspective === "teacher" ? "/teacher/timetable" : "/student/timetable"}
            className="mt-3 inline-flex h-8 items-center rounded-full border border-border px-4 text-sm font-medium hover:bg-accent"
          >
            View timetable
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 overflow-hidden border-teal/20 dark:border-gold/20">
      <CardHeader className="border-b border-border bg-accent/30 pb-4">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="teal">Next class</Badge>
          <span className="text-sm font-medium text-teal dark:text-gold">
            {formatTimeRange(lecture.startTime, lecture.endTime)}
          </span>
        </div>
        <CardTitle className="mt-2 text-xl">{lecture.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted">
          {perspective === "teacher"
            ? lecture.studentNames.join(", ") || "No students assigned"
            : lecture.teacherName}
          {lecture.serviceTitle && <p className="mt-1">{lecture.serviceTitle}</p>}
        </div>
        <JoinClassButton meetUrl={lecture.meetUrl} lecture={lecture} role={role} />
      </CardContent>
    </Card>
  );
}

export function TodayAgenda({
  lectures,
  perspective,
  emptyMessage = "No classes scheduled for today.",
}: {
  lectures: TimetableLecture[];
  perspective: "teacher" | "student";
  emptyMessage?: string;
}) {
  if (lectures.length === 0) {
    return <EmptyState icon={CalendarDays} title={emptyMessage} />;
  }

  return (
    <div className="space-y-3">
      {lectures.map((lecture) => (
        <LectureSessionCard
          key={lecture.id}
          lecture={lecture}
          showJoin
          joinRole={perspective}
          showTeacher={perspective === "student"}
          showStudents={perspective === "teacher"}
        />
      ))}
    </div>
  );
}

export function WeekAtAGlance({
  lectures,
  href,
  limit = 5,
}: {
  lectures: TimetableLecture[];
  href: string;
  limit?: number;
}) {
  const preview = lectures.slice(0, limit);
  if (preview.length === 0) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>This week</CardTitle>
        <Link href={href} className="text-xs font-medium text-teal hover:underline dark:text-gold">
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {preview.map((lecture) => (
          <div
            key={lecture.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
          >
            <span className="truncate font-medium">{lecture.title}</span>
            <span className="shrink-0 text-xs text-muted">
              {formatTimeRange(lecture.startTime, lecture.endTime)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function PortalQuickActions({ perspective }: { perspective: "teacher" | "student" }) {
  const actions =
    perspective === "teacher"
      ? [
          { label: "Timetable", href: "/teacher/timetable", icon: CalendarDays, description: "Weekly schedule" },
          { label: "Account", href: "/teacher/account", icon: UserRound, description: "Profile & settings" },
        ]
      : [
          { label: "Timetable", href: "/student/timetable", icon: CalendarDays, description: "Weekly schedule" },
          { label: "Account", href: "/student/account", icon: UserRound, description: "Profile & settings" },
        ];

  return <QuickActions actions={actions} size="lg" />;
}
