import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPlansPage() {
  const plans = await prisma.plan.findMany({
    orderBy: [{ service: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    include: { service: true, prices: true },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Plans & Prices</h1>
          <p className="mt-1 text-sm text-muted">Edit packages and multi-currency pricing.</p>
        </div>
        <Link
          href="/admin/plans/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-teal px-4 py-2 text-sm font-medium text-cream dark:bg-gold dark:text-ink"
        >
          <Plus className="h-4 w-4" /> Add plan
        </Link>
      </div>
      <div className="mt-6 grid gap-3">
        {plans.map((p) => (
          <Link
            key={p.id}
            href={`/admin/plans/${p.id}`}
            className="rounded-2xl border border-foreground/10 bg-card p-4 shadow-sm transition hover:border-gold/40"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">
                  {p.service.title} — {p.name}
                </p>
                <p className="text-xs text-muted">
                  {p.prices.length} currencies · {p.featured ? "Featured" : "Standard"}
                </p>
              </div>
              <span className="text-xs text-muted">{p.active ? "Active" : "Hidden"}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
