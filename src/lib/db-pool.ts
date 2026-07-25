import { Pool, type PoolConfig } from "pg";

export function getPoolConfig(): PoolConfig {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const needsSsl =
    connectionString.includes("neon.tech") ||
    connectionString.includes("sslmode=require") ||
    process.env.NODE_ENV === "production";

  return {
    connectionString,
    max: 10,
    ...(needsSsl && {
      ssl: { rejectUnauthorized: false },
    }),
  };
}
