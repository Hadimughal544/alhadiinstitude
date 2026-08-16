"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  createServiceAction,
  updateServiceAction,
} from "@/actions";
import { AdminModal } from "@/components/admin/admin-modal";
import { Button } from "@/components/ui/button";
import { toActionError } from "@/lib/action-result";

export type AdminService = {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  heroImage: string | null;
  features: unknown;
  faqs: unknown;
  active: boolean;
};

export function ServicesAdminPanel({ services }: { services: AdminService[] }) {
  const router = useRouter();
  const [open, setOpen] = useState<"create" | AdminService | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const close = () => {
    setOpen(null);
    setError(null);
    router.refresh();
  };

  const onCreate = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await createServiceAction(formData);
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

  const onUpdate = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await updateServiceAction(formData);
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
          <h1 className="font-display text-3xl">Services</h1>
          <p className="mt-1 text-sm text-muted">Manage public service pages and content.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setOpen("create");
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-teal px-4 py-2 text-sm font-medium text-cream dark:bg-gold dark:text-ink"
        >
          <Plus className="h-4 w-4" /> Add service
        </button>
      </div>

      <div className="mt-6 grid gap-4">
        {services.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setError(null);
              setOpen(s);
            }}
            className="rounded-2xl border border-foreground/10 bg-card p-5 text-left shadow-sm transition hover:border-gold/40"
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
          </button>
        ))}
      </div>

      <AdminModal
        open={open === "create"}
        onClose={() => setOpen(null)}
        title="Add service"
        description="Create a new service vertical for the public site."
      >
        {error && <p className="mb-4 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">{error}</p>}
        <form action={onCreate} className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Title</span>
            <input name="title" required className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Slug (optional)</span>
            <input name="slug" placeholder="auto-from-title" className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Subtitle</span>
            <input name="subtitle" required className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Description</span>
            <textarea name="description" required rows={4} className="w-full rounded-xl border border-foreground/15 bg-background px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Hero image URL</span>
            <input name="heroImage" placeholder="https://..." className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
          </label>
          <Button type="submit" disabled={pending}>{pending ? "Creating…" : "Create service"}</Button>
        </form>
      </AdminModal>

      <AdminModal
        open={typeof open === "object" && open !== null}
        onClose={() => setOpen(null)}
        title={typeof open === "object" && open ? `Edit: ${open.title}` : "Edit service"}
        wide
      >
        {error && <p className="mb-4 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">{error}</p>}
        {typeof open === "object" && open && (
          <form action={onUpdate} className="space-y-4">
            <input type="hidden" name="id" value={open.id} />
            <input type="hidden" name="slug" value={open.slug} />
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Title</span>
              <input name="title" defaultValue={open.title} className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Subtitle</span>
              <input name="subtitle" defaultValue={open.subtitle} className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Description</span>
              <textarea name="description" rows={4} defaultValue={open.description} className="w-full rounded-xl border border-foreground/15 bg-background px-3 py-2" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Hero image URL</span>
              <input name="heroImage" defaultValue={open.heroImage ?? ""} className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Features (JSON)</span>
              <textarea
                name="features"
                rows={6}
                defaultValue={JSON.stringify(open.features, null, 2)}
                className="w-full rounded-xl border border-foreground/15 bg-background px-3 py-2 font-mono text-xs"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">FAQs (JSON)</span>
              <textarea
                name="faqs"
                rows={6}
                defaultValue={JSON.stringify(open.faqs, null, 2)}
                className="w-full rounded-xl border border-foreground/15 bg-background px-3 py-2 font-mono text-xs"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="active" defaultChecked={open.active} />
              Active
            </label>
            <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save service"}</Button>
          </form>
        )}
      </AdminModal>
    </div>
  );
}
