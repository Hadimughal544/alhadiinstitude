import { ServiceGateway } from "@/components/service-gateway";
import { prisma } from "@/lib/prisma";
import { getRegionContext } from "@/lib/region";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HomeGatewayPage() {
  const region = await getRegionContext();
  if (!region) redirect("/");

  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    select: {
      slug: true,
      title: true,
      subtitle: true,
      heroImage: true,
    },
  });

  return (
    <ServiceGateway
      services={services}
      countryLabel={`${region.countryName} · ${region.currencyCode}`}
    />
  );
}
