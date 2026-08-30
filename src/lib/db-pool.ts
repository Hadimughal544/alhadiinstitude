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
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 15_000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10_000,
    ...(needsSsl && {
      ssl: { rejectUnauthorized: false },
    }),
  };
}
