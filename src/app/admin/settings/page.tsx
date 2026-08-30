import { updateSettingsAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { getSettingsMap } from "@/lib/region";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const s = await getSettingsMap();

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
        <h2 className="font-semibold">Google Meet hosts</h2>
        <p className="mt-1 text-sm text-muted">
          Each teacher connects their own Google account on their Account page. Class meetings are
          created on that teacher’s calendar so they are the host and can start the room without
          being admitted.
        </p>
      </section>
    </div>
  );
}
