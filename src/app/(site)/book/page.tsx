import { InquiryForm } from "@/components/inquiry-form";
import { FadeIn } from "@/components/motion";
import { getRegionContext, getSettingsMap } from "@/lib/region";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; plan?: string; type?: string }>;
}) {
  const region = await getRegionContext();
  if (!region) redirect("/");
  const sp = await searchParams;
  const settings = await getSettingsMap();
  const serviceSlug = sp.service || "quran";
  const type = (sp.type as "DEMO" | "ENROLL" | "PROJECT" | "COURSE") || "DEMO";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <FadeIn>
        <h1 className="font-display text-4xl">Start Your Journey</h1>
        <p className="mt-2 text-muted">
          Fill out the form below. We will respond via email or WhatsApp.
        </p>
      </FadeIn>
      <div className="mt-8">
        <InquiryForm
          serviceSlug={serviceSlug}
          planId={sp.plan}
          countryCode={region.countryCode}
          whatsapp={settings.whatsapp}
          defaultType={type}
        />
      </div>
    </div>
  );
}
