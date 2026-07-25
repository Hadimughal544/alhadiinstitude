import Link from "next/link";
import { Plus } from "lucide-react";
import { createServiceAction } from "@/actions";
import { Button } from "@/components/ui/button";

export default function NewServicePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Add service</h1>
          <p className="mt-1 text-sm text-muted">Create a new service vertical for the public site.</p>
        </div>
        <Link href="/admin/services" className="text-sm text-muted hover:text-foreground">
          Cancel
        </Link>
      </div>

      <form action={createServiceAction} className="space-y-4 rounded-2xl border border-foreground/10 bg-card p-6 shadow-sm">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Title</span>
          <input name="title" required placeholder="e.g. Language Courses" className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Slug (optional)</span>
          <input name="slug" placeholder="auto-from-title" className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Subtitle</span>
          <input name="subtitle" required placeholder="Short tagline" className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Description</span>
          <textarea name="description" required rows={4} className="w-full rounded-xl border border-foreground/15 bg-background px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Hero image URL</span>
          <input name="heroImage" placeholder="https://..." className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
        </label>
        <Button type="submit" className="gap-2">
          <Plus className="h-4 w-4" /> Create service
        </Button>
      </form>
    </div>
  );
}
