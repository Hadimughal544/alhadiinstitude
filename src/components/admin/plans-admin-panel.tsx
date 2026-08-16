"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createPlanAction, updatePlanAction } from "@/actions";
import { AdminModal } from "@/components/admin/admin-modal";
import { Button } from "@/components/ui/button";
import { PLAN_CURRENCIES } from "@/lib/currencies";
import { toActionError } from "@/lib/action-result";

export type AdminPlan = {
  id: string;
  name: string;
  badge: string | null;
  classesOrHours: string | null;
  durationMins: number | null;
  features: unknown;
  featured: boolean;
  active: boolean;
  service: { id: string; title: string };
  prices: Array<{ currencyCode: string; amount: string }>;
};

export function PlansAdminPanel({
  plans,
  services,
}: {
  plans: AdminPlan[];
  services: Array<{ id: string; title: string }>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState<"create" | AdminPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const close = () => {
    setOpen(null);
    setError(null);
    router.refresh();
  };

  const run = (action: (fd: FormData) => Promise<{ ok: true } | { ok: false; error: string }>) =>
    (formData: FormData) => {
      setError(null);
      startTransition(async () => {
        try {
          const result = await action(formData);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          close();
        } catch (e) {
          setError(toActionError(e));
        }
      });
    };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Plans & Prices</h1>
          <p className="mt-1 text-sm text-muted">Edit packages and multi-currency pricing.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setOpen("create");
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-teal px-4 py-2 text-sm font-medium text-cream dark:bg-gold dark:text-ink"
        >
          <Plus className="h-4 w-4" /> Add plan
        </button>
      </div>

      <div className="mt-6 grid gap-3">
        {plans.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setError(null);
              setOpen(p);
            }}
            className="rounded-2xl border border-foreground/10 bg-card p-4 text-left shadow-sm transition hover:border-gold/40"
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
          </button>
        ))}
      </div>

      <AdminModal
        open={open === "create"}
        onClose={() => setOpen(null)}
        title="Add plan"
        description="Optional GBP amount seeds all currencies."
      >
        {error && <p className="mb-4 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">{error}</p>}
        <form action={run(createPlanAction)} className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Service</span>
            <select name="serviceId" required className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3">
              <option value="">Select service...</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Plan name</span>
            <input name="name" required className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Badge</span>
              <input name="badge" className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Classes / Hours</span>
              <input name="classesOrHours" className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Duration (mins)</span>
              <input name="durationMins" type="number" className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Base price in GBP</span>
            <input name="baseGbp" type="number" step="0.01" className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" /> Featured plan
          </label>
          <Button type="submit" disabled={pending}>{pending ? "Creating…" : "Create plan"}</Button>
        </form>
      </AdminModal>

      <AdminModal
        open={typeof open === "object" && open !== null}
        onClose={() => setOpen(null)}
        title={typeof open === "object" && open ? `${open.service.title} — ${open.name}` : "Edit plan"}
        wide
      >
        {error && <p className="mb-4 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">{error}</p>}
        {typeof open === "object" && open && (
          <PlanEditForm plan={open} pending={pending} onSubmit={run(updatePlanAction)} />
        )}
      </AdminModal>
    </div>
  );
}

function PlanEditForm({
  plan,
  pending,
  onSubmit,
}: {
  plan: AdminPlan;
  pending: boolean;
  onSubmit: (fd: FormData) => void;
}) {
  const priceMap = Object.fromEntries(plan.prices.map((p) => [p.currencyCode, p.amount]));

  return (
    <form action={onSubmit} className="space-y-4">
      <input type="hidden" name="id" value={plan.id} />
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Name</span>
        <input name="name" defaultValue={plan.name} className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Badge</span>
          <input name="badge" defaultValue={plan.badge ?? ""} className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Classes / Hours</span>
          <input name="classesOrHours" defaultValue={plan.classesOrHours ?? ""} className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Duration (mins)</span>
          <input name="durationMins" type="number" defaultValue={plan.durationMins ?? ""} className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
        </label>
      </div>
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Features (JSON)</span>
        <textarea
          name="features"
          rows={4}
          defaultValue={JSON.stringify(plan.features, null, 2)}
          className="w-full rounded-xl border border-foreground/15 bg-background px-3 py-2 font-mono text-xs"
        />
      </label>
      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="featured" defaultChecked={plan.featured} /> Featured
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="active" defaultChecked={plan.active} /> Active
        </label>
      </div>
      <div>
        <h3 className="mb-3 font-semibold">Prices by currency</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {PLAN_CURRENCIES.map((code) => (
            <label key={code} className="block text-sm">
              <span className="mb-1 block font-medium">{code}</span>
              <input
                name={`price_${code}`}
                type="number"
                step="0.01"
                defaultValue={priceMap[code] ?? ""}
                className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3"
              />
            </label>
          ))}
        </div>
      </div>
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save plan"}</Button>
    </form>
  );
}
