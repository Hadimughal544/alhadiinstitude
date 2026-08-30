import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";
import { getPoolConfig } from "@/lib/db-pool";

const globalForPrisma = globalThis as unknown as {
  prismaWithRetry: ReturnType<typeof createPrismaClient> | undefined;
  pgPoolV2: Pool | undefined;
};

function isRetryableDbError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const name = "name" in error ? String(error.name) : "";
  if (name === "PrismaClientValidationError") return false;
  const code = "code" in error ? String(error.code) : "";
  return (
    code === "ETIMEDOUT" ||
    code === "ECONNRESET" ||
    code === "ECONNREFUSED" ||
    code === "EPIPE" ||
    code === "P1001" ||
    code === "P1008" ||
    code === "P1017" ||
    code === "P2024"
  );
}

function getPool() {
  if (!globalForPrisma.pgPoolV2) {
    const pool = new Pool(getPoolConfig());
    pool.on("error", (error) => {
      console.error("PostgreSQL pool error:", error);
    });
    globalForPrisma.pgPoolV2 = pool;
  }
  return globalForPrisma.pgPoolV2;
}

function createPrismaClient() {
  const adapter = new PrismaPg(getPool());
  return new PrismaClient({ adapter }).$extends({
    query: {
      async $allOperations({ args, query }) {
        try {
          return await query(args);
        } catch (error) {
          if (!isRetryableDbError(error)) throw error;
          await new Promise((resolve) => setTimeout(resolve, 400));
          return query(args);
        }
      },
    },
  });
}

export const prisma = globalForPrisma.prismaWithRetry ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prismaWithRetry = prisma;
