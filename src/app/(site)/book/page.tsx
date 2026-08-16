import { InquiryForm } from "@/components/inquiry-form";
import { FadeIn } from "@/components/motion";
import { getRegionContext, getSettingsMap } from "@/lib/region";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book a Demo or Enrol",
  description:
    "Book a free demo or enrol with Al-Hadi Institute for Quran tutoring, online tuition, or IT services.",
  keywords: [
    "book Quran tutor",
    "online tuition demo",
    "enrol Al-Hadi Institute",
    "IT project inquiry",
  ],
  alternates: {
    canonical: `${(process.env.NEXT_PUBLIC_SITE_URL || "https://alhadiinstitute.com").replace(/\/$/, "")}/book`,
  },
};

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; plan?: string; type?: string }>;
}) {
  const region = await getRegionContext();
  if (!region) redirect("/");
  const sp = await searchParams;
  const [settings, services] = await Promise.all([
    getSettingsMap(),
    prisma.service.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, title: true },
    }),
  ]);
  const serviceSlug = sp.service;
  const type = (sp.type as "DEMO" | "ENROLL" | "PROJECT" | "COURSE") || "DEMO";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <FadeIn>
        <h1 className="font-display text-[clamp(2.25rem,5vw,3.25rem)] font-extrabold tracking-tight">Start Your Journey</h1>
        <p className="mt-2 text-muted">
          Fill out the form below. We will respond via email or WhatsApp.
        </p>
      </FadeIn>
      <div className="mt-8">
        <InquiryForm
          serviceSlug={serviceSlug}
          services={serviceSlug ? undefined : services}
          planId={sp.plan}
          countryCode={region.countryCode}
          whatsapp={settings.whatsapp}
          defaultType={type}
        />
      </div>
    </div>
  );
}
