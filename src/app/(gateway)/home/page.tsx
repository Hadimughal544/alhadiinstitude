import { ServiceGateway } from "@/components/service-gateway";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { prisma } from "@/lib/prisma";
import { getRegionContextOrDefault, getSettingsMap } from "@/lib/region";
import type { Metadata } from "next";
import { JsonLd, breadcrumbList } from "@/lib/seo/jsonld";
import { SITE_URL } from "@/lib/seo/config";

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
  const region = await getRegionContextOrDefault();

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

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: services.map((service, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: service.title,
      url: `${SITE_URL}/${service.slug}`,
    })),
  };

  return (
    <>
      <JsonLd
        data={[
          itemList,
          breadcrumbList([
            { name: "Home", url: `${SITE_URL}/` },
            { name: "Services", url: `${SITE_URL}/home` },
          ]),
        ]}
      />
      <ServiceGateway
        services={services}
        countryLabel={`${region.countryName} · ${region.currencyCode}`}
      />
      <WhatsAppFloat number={settings.whatsapp} />
    </>
  );
}
