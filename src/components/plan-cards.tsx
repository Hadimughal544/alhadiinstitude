import Link from "next/link";
import { formatMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type PlanCardPlan = {
  id: string;
  name: string;
  badge?: string | null;
  classesOrHours?: string | null;
  durationMins?: number | null;
  features: unknown;
  featured: boolean;
  price?: { amount: string | number; currencyCode: string } | null;
  currencySymbol: string;
};

export function PlanCards({
  plans,
  serviceSlug,
}: {
  plans: PlanCardPlan[];
  serviceSlug: string;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {plans.map((plan) => {
        const features = Array.isArray(plan.features)
          ? (plan.features as string[])
          : [];
        return (
          <article
            key={plan.id}
            className={`relative flex flex-col rounded-3xl border p-6 transition ${
              plan.featured
                ? "border-gold bg-card shadow-xl shadow-gold/10 scale-[1.02]"
                : "border-foreground/10 bg-card/70"
            }`}
          >
            {plan.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-ink">
                {plan.badge}
              </span>
            )}
            <h3 className="font-display text-2xl">{plan.name}</h3>
            {plan.price && (
              <p className="mt-3 text-3xl font-semibold text-teal dark:text-gold">
                {formatMoney(plan.price.amount, plan.price.currencyCode, plan.currencySymbol)}
                {plan.classesOrHours && (
                  <span className="ml-2 text-sm font-normal text-muted">
                    / {plan.classesOrHours}
                  </span>
                )}
              </p>
            )}
            {plan.durationMins && (
              <p className="mt-1 text-sm text-muted">{plan.durationMins} min per class</p>
            )}
            <ul className="mt-5 flex-1 space-y-2 text-sm text-muted">
              {features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={`/book?service=${serviceSlug}&plan=${plan.id}`}
              className="mt-6"
            >
              <Button className="w-full" variant={plan.featured ? "secondary" : "primary"}>
                Choose Plan
              </Button>
            </Link>
          </article>
        );
      })}
    </div>
  );
}
