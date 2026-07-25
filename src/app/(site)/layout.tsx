import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getRegionContext, getSettingsMap } from "@/lib/region";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [region, settings] = await Promise.all([getRegionContext(), getSettingsMap()]);

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <SiteHeader region={region} />
      <main className="flex-1">{children}</main>
      <SiteFooter
        email={settings.contactEmail}
        whatsapp={settings.whatsapp}
      />
    </div>
  );
}
