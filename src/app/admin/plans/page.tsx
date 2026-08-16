import { PlansAdminPanel } from "@/components/admin/plans-admin-panel";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPlansPage() {
  const [plans, services] = await Promise.all([
    prisma.plan.findMany({
      orderBy: [{ service: { sortOrder: "asc" } }, { sortOrder: "asc" }],
      include: { service: true, prices: true },
    }),
    prisma.service.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, title: true },
    }),
  ]);

  return (
    <PlansAdminPanel
      services={services}
      plans={plans.map((p) => ({
        id: p.id,
        name: p.name,
        badge: p.badge,
        classesOrHours: p.classesOrHours,
        durationMins: p.durationMins,
        features: p.features,
        featured: p.featured,
        active: p.active,
        service: { id: p.service.id, title: p.service.title },
        prices: p.prices.map((price) => ({
          currencyCode: price.currencyCode,
          amount: price.amount.toString(),
        })),
      }))}
    />
  );
}
