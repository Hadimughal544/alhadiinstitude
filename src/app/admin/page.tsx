import Link from "next/link";
import {
  CalendarDays,
  GraduationCap,
  Layers,
  MessageSquare,
  Users,
} from "lucide-react";
import { DashboardCharts } from "@/components/admin/dashboard-charts";
import { GoogleConnectBanner } from "@/components/admin/google-connect-banner";
import { DataListRow } from "@/components/dashboard/data-list-row";
import { PageHeader } from "@/components/dashboard/page-header";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_TIMEZONE } from "@/lib/country-timezones";
import { isInstituteGoogleConnected } from "@/lib/meet";
import { prisma } from "@/lib/prisma";
import { getAllLectures, todaysLectures } from "@/lib/timetable/queries";
import { formatTimeRange } from "@/lib/timetable/time";

export const dynamic = "force-dynamic";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function inquiryBadge(status: string) {
  if (status === "NEW") return "info" as const;
  if (status === "CONTACTED") return "warning" as const;
  return "outline" as const;
}

export default async function AdminDashboard() {
  const now = new Date();
  const fourteenDaysAgo = startOfDay(new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000));

  const [
    newInquiries,
    totalInquiries,
    services,
    plans,
    countries,
    byService,
    byStatusGroup,
    recentInquiries,
    trendRaw,
    teacherCount,
    studentCount,
    lectureCount,
    googleConnected,
    allLectures,
  ] = await Promise.all([
    prisma.inquiry.count({ where: { status: "NEW" } }),
    prisma.inquiry.count(),
    prisma.service.count(),
    prisma.plan.count(),
    prisma.country.count({ where: { active: true } }),
    prisma.inquiry.groupBy({ by: ["serviceSlug"], _count: { _all: true } }),
    prisma.inquiry.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { plan: true },
    }),
    prisma.inquiry.findMany({
      where: { createdAt: { gte: fourteenDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.teacherProfile.count({ where: { user: { active: true } } }),
    prisma.studentProfile.count({ where: { user: { active: true } } }),
    prisma.lecture.count({ where: { active: true } }),
    isInstituteGoogleConnected(),
    getAllLectures(),
  ]);

  const todaySchedule = todaysLectures(allLectures, DEFAULT_TIMEZONE);

  const trendMap = new Map<string, number>();
  for (let i = 0; i < 14; i++) {
    const d = new Date(fourteenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
    const key = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    trendMap.set(key, 0);
  }
  for (const row of trendRaw) {
    const key = row.createdAt.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
    trendMap.set(key, (trendMap.get(key) ?? 0) + 1);
  }
  const trend = Array.from(trendMap.entries()).map(([date, count]) => ({ date, count }));
  const firstWeek = trend.slice(0, 7).reduce((s, r) => s + r.count, 0);
  const secondWeek = trend.slice(7).reduce((s, r) => s + r.count, 0);
  const inquiryTrend =
    firstWeek > 0
      ? `${secondWeek >= firstWeek ? "+" : ""}${Math.round(((secondWeek - firstWeek) / firstWeek) * 100)}% vs prior week`
      : undefined;

  const byServiceChart = byService.map((r) => ({
    name: r.serviceSlug.charAt(0).toUpperCase() + r.serviceSlug.slice(1),
    value: r._count._all,
  }));

  const statusOrder = ["NEW", "CONTACTED", "CLOSED"] as const;
  const statusCounts = Object.fromEntries(
    byStatusGroup.map((r) => [r.status, r._count._all])
  ) as Record<string, number>;
  const byStatus = statusOrder.map((name) => ({
    name,
    value: statusCounts[name] ?? 0,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of your institution — people, schedule, and inquiries."
        action={
          <Link
            href="/admin/inquiries"
            className="inline-flex h-8 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium hover:bg-accent"
          >
            <MessageSquare className="h-4 w-4" />
            Inquiries
          </Link>
        }
      />

      {!googleConnected && <GoogleConnectBanner />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Students" value={studentCount} icon={GraduationCap} href="/admin/students" />
        <StatCard label="Teachers" value={teacherCount} icon={Users} href="/admin/teachers" />
        <StatCard label="Active classes" value={lectureCount} icon={CalendarDays} href="/admin/timetable" />
        <StatCard
          label="New inquiries"
          value={newInquiries}
          hint={`${totalInquiries} total`}
          icon={MessageSquare}
          href="/admin/inquiries"
          trend={inquiryTrend ? { value: inquiryTrend, positive: secondWeek >= firstWeek } : undefined}
        />
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">Quick actions</h2>
        <QuickActions
          actions={[
            { label: "Add student", href: "/admin/students", icon: GraduationCap, description: "Enroll a learner" },
            { label: "Add teacher", href: "/admin/teachers", icon: Users, description: "Onboard staff" },
            { label: "Timetable", href: "/admin/timetable", icon: CalendarDays, description: "Schedule classes" },
            { label: "New service", href: "/admin/services/new", icon: Layers, description: "Marketing catalog" },
            { label: "Inquiries", href: "/admin/inquiries", icon: MessageSquare, description: "Review leads" },
          ]}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Today&apos;s schedule</CardTitle>
            <Link href="/admin/timetable" className="text-xs font-medium text-teal dark:text-gold">
              Full timetable
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {todaySchedule.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">No classes scheduled for today.</p>
            ) : (
              todaySchedule.map((lecture) => (
                <div
                  key={lecture.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{lecture.title}</p>
                    <p className="text-xs text-muted">
                      {formatTimeRange(lecture.startTime, lecture.endTime)} · {lecture.teacherName}
                    </p>
                  </div>
                  <Badge variant="outline">{lecture.studentNames.length} students</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Catalog snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { label: "Countries", value: countries, href: "/admin/countries" },
              { label: "Services", value: services, href: "/admin/services" },
              { label: "Plans", value: plans, href: "/admin/plans" },
              { label: "Teachers", value: teacherCount, href: "/admin/teachers" },
              { label: "Students", value: studentCount, href: "/admin/students" },
            ].map((row) => (
              <Link
                key={row.label}
                href={row.href}
                className="flex items-center justify-between rounded-lg px-2 py-1.5 transition hover:bg-accent"
              >
                <span className="text-muted">{row.label}</span>
                <span className="font-semibold">{row.value}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <DashboardCharts byService={byServiceChart} byStatus={byStatus} trend={trend} />

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Recent inquiries</h2>
          <Link href="/admin/inquiries" className="text-sm font-medium text-teal dark:text-gold">
            View all
          </Link>
        </div>
        <div className="space-y-2">
          {recentInquiries.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted">
              No inquiries yet.
            </p>
          ) : (
            recentInquiries.map((inq) => (
              <DataListRow
                key={inq.id}
                name={inq.name}
                subtitle={inq.email}
                meta={`${inq.serviceSlug}${inq.plan ? ` · ${inq.plan.name}` : ""} · ${inq.type}`}
                badge={inq.status}
                badgeVariant={inquiryBadge(inq.status)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
