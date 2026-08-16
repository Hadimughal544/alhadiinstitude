"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createCountryAction, updateCountryAction } from "@/actions";
import { AdminModal } from "@/components/admin/admin-modal";
import { Button } from "@/components/ui/button";
import { toActionError } from "@/lib/action-result";

export type AdminCountry = {
  id: string;
  code: string;
  name: string;
  currencyCode: string;
  currencySymbol: string;
  flagEmoji: string;
  sortOrder: number;
  active: boolean;
};

export function CountriesAdminPanel({ countries }: { countries: AdminCountry[] }) {
  const router = useRouter();
  const [open, setOpen] = useState<"create" | AdminCountry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const close = () => {
    setOpen(null);
    setError(null);
    router.refresh();
  };

  const run =
    (action: (fd: FormData) => Promise<{ ok: true } | { ok: false; error: string }>) =>
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
          <h1 className="font-display text-3xl">Countries</h1>
          <p className="mt-1 text-sm text-muted">Regions shown on the country selector.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setOpen("create");
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-teal px-4 py-2 text-sm font-medium text-cream dark:bg-gold dark:text-ink"
        >
          <Plus className="h-4 w-4" /> Add country
        </button>
      </div>

      <div className="mt-6 grid gap-3">
        {countries.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              setError(null);
              setOpen(c);
            }}
            className="rounded-2xl border border-foreground/10 bg-card p-4 text-left shadow-sm transition hover:border-gold/40"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">
                  {c.flagEmoji} {c.name}
                </p>
                <p className="text-xs text-muted">
                  {c.code} · {c.currencyCode} ({c.currencySymbol})
                </p>
              </div>
              <span className={`text-xs ${c.active ? "text-teal dark:text-gold" : "text-muted"}`}>
                {c.active ? "Active" : "Hidden"}
              </span>
            </div>
          </button>
        ))}
      </div>

      <AdminModal
        open={open === "create"}
        onClose={() => setOpen(null)}
        title="Add country"
        description="Add a region for the country selector and currency display."
      >
        {error && <p className="mb-4 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">{error}</p>}
        <form action={run(createCountryAction)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Country code</span>
              <input name="code" required maxLength={8} className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3 uppercase" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Name</span>
              <input name="name" required className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Currency code</span>
              <input name="currencyCode" required className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3 uppercase" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Symbol</span>
              <input name="currencySymbol" required className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Flag emoji</span>
              <input name="flagEmoji" defaultValue="🏳️" className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Sort order</span>
            <input name="sortOrder" type="number" defaultValue={99} className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
          </label>
          <Button type="submit" disabled={pending}>{pending ? "Creating…" : "Create country"}</Button>
        </form>
      </AdminModal>

      <AdminModal
        open={typeof open === "object" && open !== null}
        onClose={() => setOpen(null)}
        title={typeof open === "object" && open ? `Edit: ${open.name}` : "Edit country"}
      >
        {error && <p className="mb-4 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">{error}</p>}
        {typeof open === "object" && open && (
          <form action={run(updateCountryAction)} className="space-y-4">
            <input type="hidden" name="id" value={open.id} />
            <p className="text-xs text-muted">
              {open.code} · {open.currencyCode}
            </p>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Name</span>
              <input name="name" defaultValue={open.name} className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Flag</span>
              <input name="flagEmoji" defaultValue={open.flagEmoji} className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Symbol</span>
              <input name="currencySymbol" defaultValue={open.currencySymbol} className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Sort order</span>
              <input name="sortOrder" type="number" defaultValue={open.sortOrder} className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="active" defaultChecked={open.active} /> Active
            </label>
            <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save country"}</Button>
          </form>
        )}
      </AdminModal>
    </div>
  );
}
