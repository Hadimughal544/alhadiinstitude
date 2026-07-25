import { notFound } from "next/navigation";
import { updatePlanAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CURRENCIES = ["PKR", "USD", "GBP", "CAD", "AUD", "NZD", "BDT", "SAR", "ZAR"];

export default async function EditPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plan = await prisma.plan.findUnique({
    where: { id },
    include: { prices: true, service: true },
  });
  if (!plan) notFound();

  const priceMap = Object.fromEntries(plan.prices.map((p) => [p.currencyCode, p.amount.toString()]));

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl">
        {plan.service.title} — {plan.name}
      </h1>
      <form action={updatePlanAction} className="mt-6 space-y-4">
        <input type="hidden" name="id" value={plan.id} />
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Name</span>
          <input name="name" defaultValue={plan.name} className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Badge</span>
            <input name="badge" defaultValue={plan.badge ?? ""} className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Classes / Hours</span>
            <input name="classesOrHours" defaultValue={plan.classesOrHours ?? ""} className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Duration (mins)</span>
            <input name="durationMins" type="number" defaultValue={plan.durationMins ?? ""} className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3" />
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Features (JSON array of strings)</span>
          <textarea
            name="features"
            rows={5}
            defaultValue={JSON.stringify(plan.features, null, 2)}
            className="w-full rounded-xl border border-foreground/15 bg-background px-3 py-2 font-mono text-xs"
          />
        </label>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="featured" defaultChecked={plan.featured} /> Featured
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="active" defaultChecked={plan.active} /> Active
          </label>
        </div>

        <div>
          <h2 className="mb-3 font-semibold">Prices by currency</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {CURRENCIES.map((code) => (
              <label key={code} className="block text-sm">
                <span className="mb-1 block font-medium">{code}</span>
                <input
                  name={`price_${code}`}
                  type="number"
                  step="0.01"
                  defaultValue={priceMap[code] ?? ""}
                  className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3"
                />
              </label>
            ))}
          </div>
        </div>

        <Button type="submit">Save plan</Button>
      </form>
    </div>
  );
}
