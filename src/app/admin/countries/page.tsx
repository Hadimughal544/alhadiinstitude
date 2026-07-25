import Link from "next/link";
import { Plus } from "lucide-react";
import { updateCountryAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCountriesPage() {
  const countries = await prisma.country.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Countries</h1>
          <p className="mt-1 text-sm text-muted">Regions shown on the country selector.</p>
        </div>
        <Link
          href="/admin/countries/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-teal px-4 py-2 text-sm font-medium text-cream dark:bg-gold dark:text-ink"
        >
          <Plus className="h-4 w-4" /> Add country
        </Link>
      </div>
      <div className="mt-6 space-y-4">
        {countries.map((c) => (
          <form
            key={c.id}
            action={updateCountryAction}
            className="grid gap-3 rounded-2xl border border-foreground/10 bg-card p-4 shadow-sm sm:grid-cols-6 sm:items-end"
          >
            <input type="hidden" name="id" value={c.id} />
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block text-xs text-muted">Name</span>
              <input name="name" defaultValue={c.name} className="h-10 w-full rounded-lg border border-foreground/15 bg-background px-2" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs text-muted">Flag</span>
              <input name="flagEmoji" defaultValue={c.flagEmoji} className="h-10 w-full rounded-lg border border-foreground/15 bg-background px-2" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs text-muted">Symbol</span>
              <input name="currencySymbol" defaultValue={c.currencySymbol} className="h-10 w-full rounded-lg border border-foreground/15 bg-background px-2" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs text-muted">Order</span>
              <input name="sortOrder" type="number" defaultValue={c.sortOrder} className="h-10 w-full rounded-lg border border-foreground/15 bg-background px-2" />
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="active" defaultChecked={c.active} /> Active
              </label>
              <Button type="submit" size="sm">
                Save
              </Button>
            </div>
            <p className="text-xs text-muted sm:col-span-6">
              {c.code} · {c.currencyCode}
            </p>
          </form>
        ))}
      </div>
    </div>
  );
}
