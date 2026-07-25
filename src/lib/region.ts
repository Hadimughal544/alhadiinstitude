import { cookies } from "next/headers";
import { COUNTRY_COOKIE, CURRENCY_COOKIE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export type RegionContext = {
  countryCode: string;
  currencyCode: string;
  currencySymbol: string;
  countryName: string;
};

export async function getRegionContext(): Promise<RegionContext | null> {
  const jar = await cookies();
  const countryCode = jar.get(COUNTRY_COOKIE)?.value;
  const currencyCode = jar.get(CURRENCY_COOKIE)?.value;
  if (!countryCode || !currencyCode) return null;

  const country = await prisma.country.findUnique({ where: { code: countryCode } });
  if (!country) {
    return {
      countryCode,
      currencyCode,
      currencySymbol: currencyCode,
      countryName: countryCode,
    };
  }

  return {
    countryCode: country.code,
    currencyCode: country.currencyCode,
    currencySymbol: country.currencySymbol,
    countryName: country.name,
  };
}

export async function getActiveCountries() {
  return prisma.country.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getSettingsMap() {
  const rows = await prisma.siteSetting.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<string, string>;
}
