"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#0d4f4f", "#c4a35a", "#166666", "#5c6f72", "#d4b76e", "#1a7a7a"];

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  color: "var(--foreground)",
};

export function DashboardCharts({
  byService,
  byStatus,
  trend,
}: {
  byService: { name: string; value: number }[];
  byStatus: { name: string; value: number }[];
  trend: { date: string; count: number }[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Inquiries — last 14 days
        </h2>
        <div className="mt-4 h-56 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="inqFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d4f4f" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#0d4f4f" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.08} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted)" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--muted)" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#0d4f4f"
                fill="url(#inqFill)"
                strokeWidth={2}
                name="Inquiries"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          By service
        </h2>
        <div className="mt-4 h-56 sm:h-64">
          {byService.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-muted">
              No inquiry data yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byService}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.08} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted)" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--muted)" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} name="Inquiries">
                  {byService.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5 lg:col-span-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          By status
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="h-56 sm:h-64">
            {byStatus.every((s) => s.value === 0) ? (
              <p className="flex h-full items-center justify-center text-sm text-muted">
                No inquiry data yet
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {byStatus.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <ul className="flex flex-col justify-center gap-3">
            {byStatus.map((s, i) => (
              <li
                key={s.name}
                className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  {s.name}
                </span>
                <span className="text-lg font-semibold">{s.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
