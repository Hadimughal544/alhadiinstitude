import { PlanCards } from "@/components/plan-cards";
import { FadeIn } from "@/components/motion";
import { prisma } from "@/lib/prisma";
import { getRegionContext } from "@/lib/region";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const region = await getRegionContext();
  if (!region) redirect("/");

  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    include: {
      plans: {
        where: { active: true },
        orderBy: { sortOrder: "asc" },
        include: { prices: true },
      },
    },
  });

  return (
    <div className="mesh-bg mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <FadeIn>
        <h1 className="font-display text-4xl">Pricing</h1>
        <p className="mt-2 text-muted">
          All plans in {region.currencyCode} for {region.countryName}.
        </p>
      </FadeIn>

      <div className="mt-14 space-y-16">
        {services.map((service) => {
          const plans = service.plans.map((p) => {
            const price =
              p.prices.find((x) => x.currencyCode === region.currencyCode) ?? p.prices[0];
            return {
              ...p,
              price: price
                ? { amount: price.amount.toString(), currencyCode: price.currencyCode }
                : null,
              currencySymbol: region.currencySymbol,
            };
          });
          return (
            <section key={service.id}>
              <h2 className="font-display text-3xl">{service.title}</h2>
              <p className="mt-1 text-sm text-muted">{service.subtitle}</p>
              <div className="mt-8">
                <PlanCards plans={plans} serviceSlug={service.slug} />
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
