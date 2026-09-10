import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { COUNTRY_TIMEZONES, DEFAULT_TIMEZONE, isValidTimezone } from "../src/lib/country-timezones";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("sslmode=require")
    ? { rejectUnauthorized: false }
    : undefined,
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const countries = await prisma.country.findMany({
    select: { id: true, code: true, name: true, timezone: true },
  });

  for (const c of countries) {
    if (isValidTimezone(c.timezone)) continue;
    const fixed = COUNTRY_TIMEZONES[c.code] || DEFAULT_TIMEZONE;
    await prisma.country.update({ where: { id: c.id }, data: { timezone: fixed } });
    console.log(`Fixed ${c.code} (${c.name}): "${c.timezone}" -> "${fixed}"`);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
