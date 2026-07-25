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
    </div>
  );
}
