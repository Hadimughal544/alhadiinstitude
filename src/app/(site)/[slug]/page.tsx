import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ServicePageContent } from "@/components/service-page-content";
import { prisma } from "@/lib/prisma";
import { getRegionContextOrDefault } from "@/lib/region";
import { JsonLd, breadcrumbList } from "@/lib/seo/jsonld";
import { SITE_URL, SITE_NAME, ORG } from "@/lib/seo/config";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ slug: string }>;
};

type Faq = { q: string; a: string };

export async function generateStaticParams() {
  const services = await prisma.service.findMany({
    where: { active: true },
    select: { slug: true },
  });
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await prisma.service.findFirst({
    where: { slug, active: true },
    select: { title: true, subtitle: true, description: true, heroImage: true, slug: true },
  });
  if (!service) return { title: "Service" };

  return {
    title: service.title,
    description: service.subtitle || service.description.slice(0, 160),
    keywords: [service.title, SITE_NAME, "online learning", slug],
    alternates: {
      canonical: `${SITE_URL}/${service.slug}`,
    },
    openGraph: {
      title: `${service.title} | ${SITE_NAME}`,
      description: service.subtitle,
      url: `${SITE_URL}/${service.slug}`,
      images: service.heroImage ? [{ url: service.heroImage }] : undefined,
    },
  };
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params;
  const region = await getRegionContextOrDefault();

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

  const faqs = (Array.isArray(service.faqs) ? service.faqs : []) as Faq[];
  const url = `${SITE_URL}/${service.slug}`;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.subtitle || service.description.slice(0, 300),
    url,
    ...(service.heroImage ? { image: service.heroImage } : {}),
    provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    areaServed: "Worldwide",
  };

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: service.title,
    description: service.subtitle || service.description.slice(0, 300),
    url,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      ...(ORG.sameAs.length ? { sameAs: ORG.sameAs } : {}),
    },
  };

  const faqSchema =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: { "@type": "Answer", text: faq.a },
          })),
        }
      : null;

  const schemas: Record<string, unknown>[] = [
    serviceSchema,
    courseSchema,
    breadcrumbList([
      { name: "Home", url: `${SITE_URL}/` },
      { name: service.title, url },
    ]),
  ];
  if (faqSchema) schemas.push(faqSchema);

  return (
    <>
      <JsonLd data={schemas} />
      <ServicePageContent service={service} plans={service.plans} region={region} />
    </>
  );
}
