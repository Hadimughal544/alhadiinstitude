"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createCountryAction, updateCountryAction } from "@/actions";
import { AdminModal } from "@/components/admin/admin-modal";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useServerAction } from "@/hooks/use-server-action";

export type AdminCountry = {
  id: string;
  code: string;
  name: string;
  currencyCode: string;
  currencySymbol: string;
  flagEmoji: string;
  timezone: string;
  sortOrder: number;
  active: boolean;
};

export function CountriesAdminPanel({ countries }: { countries: AdminCountry[] }) {
  const router = useRouter();
  const [open, setOpen] = useState<"create" | AdminCountry | null>(null);

  const createRun = useServerAction(createCountryAction);
  const updateRun = useServerAction(updateCountryAction);

  const close = () => {
    setOpen(null);
    createRun.reset();
    updateRun.reset();
    router.refresh();
  };

  const columns: DataTableColumn<AdminCountry>[] = [
    {
      key: "name",
      header: "Country",
      render: (c) => (
        <div>
          <p className="font-medium">
            {c.flagEmoji} {c.name}
          </p>
          <p className="text-xs text-muted">{c.code}</p>
        </div>
      ),
    },
    {
      key: "currency",
      header: "Currency",
      render: (c) => (
        <span>
          {c.currencyCode} ({c.currencySymbol})
        </span>
      ),
    },
    { key: "timezone", header: "Timezone", render: (c) => c.timezone },
    { key: "sortOrder", header: "Sort", className: "text-center", render: (c) => c.sortOrder },
    {
      key: "active",
      header: "Status",
      render: (c) => (
        <Badge variant={c.active ? "teal" : "outline"}>{c.active ? "Active" : "Hidden"}</Badge>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Countries"
        description="Regions shown on the country selector."
        action={
          <Button
            type="button"
            onClick={() => {
              createRun.reset();
              setOpen("create");
            }}
          >
            <Plus className="h-4 w-4" /> Add country
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={countries}
        onRowClick={(c) => {
          updateRun.reset();
          setOpen(c);
        }}
        emptyLabel="No countries yet."
      />

      <AdminModal
        open={open === "create"}
        onClose={() => setOpen(null)}
        title="Add country"
        description="Add a region for the country selector and currency display."
      >
        {createRun.error && (
          <p className="mb-4 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
            {createRun.error}
          </p>
        )}
        <form action={(formData) => createRun.run(formData, close)} className="space-y-4">
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
            <span className="mb-1 block font-medium">Timezone (IANA)</span>
            <input
              name="timezone"
              defaultValue="Asia/Karachi"
              placeholder="Asia/Karachi"
              className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Sort order</span>
            <input name="sortOrder" type="number" defaultValue={99} className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
          </label>
          <Button type="submit" disabled={createRun.pending}>
            {createRun.pending ? "Creating…" : "Create country"}
          </Button>
        </form>
      </AdminModal>

      <AdminModal
        open={typeof open === "object" && open !== null}
        onClose={() => setOpen(null)}
        title={typeof open === "object" && open ? `Edit: ${open.name}` : "Edit country"}
      >
        {updateRun.error && (
          <p className="mb-4 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
            {updateRun.error}
          </p>
        )}
        {typeof open === "object" && open && (
          <form action={(formData) => updateRun.run(formData, close)} className="space-y-4">
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
              <span className="mb-1 block font-medium">Timezone (IANA)</span>
              <input name="timezone" defaultValue={open.timezone} className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Sort order</span>
              <input name="sortOrder" type="number" defaultValue={open.sortOrder} className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="active" defaultChecked={open.active} /> Active
            </label>
            <Button type="submit" disabled={updateRun.pending}>
              {updateRun.pending ? "Saving…" : "Save country"}
            </Button>
          </form>
        )}
      </AdminModal>
    </div>
  );
}
