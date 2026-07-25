import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Services</h1>
          <p className="mt-1 text-sm text-muted">Manage public service pages and content.</p>
        </div>
        <Link
          href="/admin/services/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-teal px-4 py-2 text-sm font-medium text-cream dark:bg-gold dark:text-ink"
        >
          <Plus className="h-4 w-4" /> Add service
        </Link>
      </div>
      <div className="mt-6 grid gap-4">
        {services.map((s) => (
          <Link
            key={s.id}
            href={`/admin/services/${s.id}`}
            className="rounded-2xl border border-foreground/10 bg-card p-5 shadow-sm transition hover:border-gold/40"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{s.title}</p>
                <p className="text-sm text-muted">/{s.slug}</p>
              </div>
              <span className={`text-xs ${s.active ? "text-teal dark:text-gold" : "text-muted"}`}>
                {s.active ? "Active" : "Hidden"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
