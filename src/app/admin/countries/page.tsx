import { CountriesAdminPanel } from "@/components/admin/countries-admin-panel";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCountriesPage() {
  const countries = await prisma.country.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <CountriesAdminPanel
      countries={countries.map((c) => ({
        id: c.id,
        code: c.code,
        name: c.name,
        currencyCode: c.currencyCode,
        currencySymbol: c.currencySymbol,
        flagEmoji: c.flagEmoji,
        sortOrder: c.sortOrder,
        active: c.active,
      }))}
    />
  );
}
