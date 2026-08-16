import { ServicesAdminPanel } from "@/components/admin/services-admin-panel";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <ServicesAdminPanel
      services={services.map((s) => ({
        id: s.id,
        title: s.title,
        slug: s.slug,
        subtitle: s.subtitle,
        description: s.description,
        heroImage: s.heroImage,
        features: s.features,
        faqs: s.faqs,
        active: s.active,
      }))}
    />
  );
}
