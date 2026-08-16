import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ServicePageContent } from "@/components/service-page-content";
import { prisma } from "@/lib/prisma";
import { getRegionContext } from "@/lib/region";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await prisma.service.findFirst({
    where: { slug, active: true },
    select: { title: true, subtitle: true, description: true, heroImage: true, slug: true },
  });
  if (!service) return { title: "Service" };

  const siteUrl =
    (process.env.NEXT_PUBLIC_SITE_URL || "https://alhadiinstitute.com").replace(/\/$/, "");

  return {
    title: service.title,
    description: service.subtitle || service.description.slice(0, 160),
    keywords: [
      service.title,
      "Al-Hadi Institute",
      "online learning",
      slug,
    ],
    alternates: {
      canonical: `${siteUrl}/services/${service.slug}`,
    },
    openGraph: {
      title: `${service.title} | Al-Hadi Institute`,
      description: service.subtitle,
      url: `${siteUrl}/services/${service.slug}`,
      images: service.heroImage ? [{ url: service.heroImage }] : undefined,
    },
  };
}

export default async function ServicePage({
  params,
}: PageProps) {
  const { slug } = await params;
  const region = await getRegionContext();
  if (!region) notFound();

  const service = await prisma.service.findFirst({
    where: { slug, active: true },
    include: {
      plans: {
        where: { active: true },
        orderBy: { sortOrder: "asc" },
        include: { prices: true },
      },
    },
  });

  if (!service) notFound();

  return (
    <ServicePageContent
      service={service}
      plans={service.plans}
      region={region}
    />
  );
}
