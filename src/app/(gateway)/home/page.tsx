import { ServiceGateway } from "@/components/service-gateway";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { prisma } from "@/lib/prisma";
import { getRegionContext, getSettingsMap } from "@/lib/region";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Choose Holy Quran tutors, online tuition, or IT services from Al-Hadi Institute.",
  keywords: [
    "Al-Hadi Institute",
    "Quran tutors",
    "online tuition",
    "IT services",
  ],
  alternates: {
    canonical: `${(process.env.NEXT_PUBLIC_SITE_URL || "https://alhadiinstitute.com").replace(/\/$/, "")}/home`,
  },
};

export default async function HomeGatewayPage() {
  const region = await getRegionContext();
  if (!region) redirect("/");

  const [services, settings] = await Promise.all([
    prisma.service.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: {
        slug: true,
        title: true,
        subtitle: true,
        heroImage: true,
      },
    }),
    getSettingsMap(),
  ]);

  return (
    <>
      <ServiceGateway
        services={services}
        countryLabel={`${region.countryName} · ${region.currencyCode}`}
      />
      <WhatsAppFloat number={settings.whatsapp} />
    </>
  );
}
