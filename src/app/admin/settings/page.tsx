import Link from "next/link";
import { updateSettingsAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { getSettingsMap } from "@/lib/region";
import { getInstituteGoogleConnection } from "@/lib/meet";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [s, googleConnection] = await Promise.all([getSettingsMap(), getInstituteGoogleConnection()]);

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl">Settings</h1>
      <form action={updateSettingsAction} className="mt-6 space-y-4">
        {(
          [
            ["brandName", "Brand name"],
            ["tagline", "Tagline"],
            ["whatsapp", "WhatsApp number"],
            ["contactEmail", "Contact email"],
            ["countryBackground", "Country page background URL"],
            ["homeHeroImage", "Home hero image URL"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block text-sm">
            <span className="mb-1 block font-medium">{label}</span>
            <input
              name={key}
              defaultValue={s[key] ?? ""}
              className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3"
            />
          </label>
        ))}
        <Button type="submit">Save settings</Button>
      </form>

      <section className="mt-10 rounded-2xl border border-foreground/10 bg-card p-5">
        <h2 className="font-semibold">Class timezone</h2>
        <p className="mt-1 text-sm text-muted">
          Admin and teachers schedule and see classes in Pakistan (Asia/Karachi). Students see the same
          moment in their country timezone.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-foreground/10 bg-card p-5">
        <h2 className="font-semibold">Institute Google (class Meet links)</h2>
        <p className="mt-1 text-sm text-muted">
          One institute Google account hosts every class. Each lecture gets an open Google Meet link
          that anyone can join with no waiting room.
        </p>
        <p className="mt-2 text-sm">
          {googleConnection ? (
            <>
              Connected as <span className="font-medium">{googleConnection.email}</span>.
            </>
          ) : (
            <span className="text-red-600">Not connected — classes cannot get Meet links yet.</span>
          )}
        </p>
        <Link
          href="/admin/settings/google"
          className="mt-3 inline-flex text-sm font-medium text-teal underline dark:text-gold"
        >
          Manage the institute Google connection →
        </Link>
      </section>
    </div>
  );
}
