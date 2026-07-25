import { notFound } from "next/navigation";
import { ServicePageContent } from "@/components/service-page-content";
import { prisma } from "@/lib/prisma";
import { getRegionContext } from "@/lib/region";

export const dynamic = "force-dynamic";

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
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
