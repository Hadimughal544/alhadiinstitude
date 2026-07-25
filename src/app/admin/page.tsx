import Link from "next/link";
import {
  MessageSquare,
  Layers,
  CreditCard,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { DashboardCharts } from "@/components/admin/dashboard-charts";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
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
  ]);

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

  const cards = [
    { label: "New inquiries", value: newInquiries, href: "/admin/inquiries", icon: MessageSquare, tone: "bg-teal/10 text-teal dark:bg-gold/15 dark:text-gold" },
    { label: "Total inquiries", value: totalInquiries, href: "/admin/inquiries", icon: MessageSquare, tone: "bg-gold/15 text-ink dark:text-gold" },
    { label: "Services", value: services, href: "/admin/services", icon: Layers, tone: "bg-teal/10 text-teal" },
    { label: "Plans", value: plans, href: "/admin/plans", icon: CreditCard, tone: "bg-foreground/5 text-foreground" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">Dashboard</h1>
          <p className="mt-1 text-muted">
            Analytics and quick actions for AlHadiInstitude.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/services/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-teal px-4 py-2 text-sm font-medium text-cream dark:bg-gold dark:text-ink"
          >
            <Plus className="h-4 w-4" /> Service
          </Link>
          <Link
            href="/admin/plans/new"
            className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 bg-card px-4 py-2 text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> Plan
          </Link>
          <Link
            href="/admin/countries/new"
            className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 bg-card px-4 py-2 text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> Country
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              href={c.href}
              className="group rounded-2xl border border-foreground/10 bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${c.tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted opacity-0 transition group-hover:opacity-100" />
              </div>
              <p className="mt-4 text-sm text-muted">{c.label}</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight">{c.value}</p>
            </Link>
          );
        })}
      </div>

      <DashboardCharts
        byService={byServiceChart}
        byStatus={byStatus}
        trend={trend}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-foreground/10 bg-card p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent inquiries</h2>
            <Link href="/admin/inquiries" className="text-sm text-teal dark:text-gold">
              View all
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-foreground/5">
            {recentInquiries.length === 0 && (
              <li className="py-6 text-center text-sm text-muted">No inquiries yet.</li>
            )}
            {recentInquiries.map((inq) => (
              <li key={inq.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-medium">{inq.name}</p>
                  <p className="text-xs text-muted">
                    {inq.serviceSlug}
                    {inq.plan ? ` · ${inq.plan.name}` : ""} · {inq.type}
                  </p>
                </div>
                <span className="rounded-full bg-foreground/5 px-2.5 py-1 text-xs font-medium">
                  {inq.status}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-foreground/10 bg-card p-5 shadow-sm">
          <h2 className="font-semibold">Catalog snapshot</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex justify-between border-b border-foreground/5 pb-3">
              <span className="text-muted">Active countries</span>
              <span className="font-semibold">{countries}</span>
            </li>
            <li className="flex justify-between border-b border-foreground/5 pb-3">
              <span className="text-muted">Services</span>
              <span className="font-semibold">{services}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted">Pricing plans</span>
              <span className="font-semibold">{plans}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
