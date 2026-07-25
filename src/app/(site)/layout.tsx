import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getRegionContext, getSettingsMap } from "@/lib/region";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [region, settings] = await Promise.all([getRegionContext(), getSettingsMap()]);

  return (
    <>
      <SiteHeader brandName={settings.brandName || "AlHadiInstitude"} region={region} />
      <main className="flex-1">{children}</main>
      <SiteFooter
        brandName={settings.brandName || "AlHadiInstitude"}
        email={settings.contactEmail}
        whatsapp={settings.whatsapp}
      />
    </>
  );
}
