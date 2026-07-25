import Link from "next/link";
import { Plus } from "lucide-react";
import { createPlanAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewPlanPage() {
  const services = await prisma.service.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Add plan</h1>
          <p className="mt-1 text-sm text-muted">
            Create a pricing plan. Optional GBP amount seeds all currencies.
          </p>
        </div>
        <Link href="/admin/plans" className="text-sm text-muted hover:text-foreground">
          Cancel
        </Link>
      </div>

      <form action={createPlanAction} className="space-y-4 rounded-2xl border border-foreground/10 bg-card p-6 shadow-sm">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Service</span>
          <select name="serviceId" required className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3">
            <option value="">Select service...</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Plan name</span>
          <input name="name" required placeholder="e.g. Standard Plan" className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Badge</span>
            <input name="badge" placeholder="Popular" className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Classes / Hours</span>
            <input name="classesOrHours" placeholder="8 Classes" className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Duration (mins)</span>
            <input name="durationMins" type="number" className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Base price in GBP (seeds all currencies)</span>
          <input name="baseGbp" type="number" step="0.01" placeholder="30" className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" /> Featured plan
        </label>
        <Button type="submit" className="gap-2">
          <Plus className="h-4 w-4" /> Create plan
        </Button>
      </form>
    </div>
  );
}
