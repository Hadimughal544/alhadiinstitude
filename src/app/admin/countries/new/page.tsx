import Link from "next/link";
import { Plus } from "lucide-react";
import { createCountryAction } from "@/actions";
import { Button } from "@/components/ui/button";

export default function NewCountryPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Add country</h1>
          <p className="mt-1 text-sm text-muted">
            Add a region for the country selector and currency display.
          </p>
        </div>
        <Link href="/admin/countries" className="text-sm text-muted hover:text-foreground">
          Cancel
        </Link>
      </div>

      <form action={createCountryAction} className="space-y-4 rounded-2xl border border-foreground/10 bg-card p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Country code</span>
            <input name="code" required placeholder="AE" maxLength={8} className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3 uppercase" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Name</span>
            <input name="name" required placeholder="United Arab Emirates" className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Currency code</span>
            <input name="currencyCode" required placeholder="AED" className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3 uppercase" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Symbol</span>
            <input name="currencySymbol" required placeholder="د.إ" className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
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
        <Button type="submit" className="gap-2">
          <Plus className="h-4 w-4" /> Create country
        </Button>
      </form>
    </div>
  );
}
