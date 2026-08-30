/**
 * One-off backfill: give every existing Lecture an open Google Meet space on the
 * institute account. Run once after the institute Google account is connected:
 *
 *   npx tsx scripts/backfill-meet-spaces.ts
 *
 * Safe to re-run — it only touches lectures without a meetSpaceId. Old per-teacher
 * calendar events (googleEventId) are left as-is; they become inert once teacher
 * Google tokens are removed.
 *
 * This script is standalone (no "server-only" imports) so it runs under tsx.
 */
import "dotenv/config";
import { createDecipheriv } from "crypto";
import { google } from "googleapis";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("sslmode=require")
    ? { rejectUnauthorized: false }
    : undefined,
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

function decryptSecret(payload: string): string {
  const key = Buffer.from(process.env.TOKEN_ENC_KEY || "", "base64");
  if (key.length !== 32) throw new Error("TOKEN_ENC_KEY must be 32 bytes as base64.");
  const [version, ivB64, tagB64, dataB64] = payload.split(":");
  if (version !== "v1") throw new Error("Unexpected secret format.");
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

async function main() {
  const connection = await prisma.googleConnection.findFirst({ orderBy: { connectedAt: "desc" } });
  if (!connection) {
    throw new Error("No institute Google connection. Connect it at /admin/settings/google first.");
  }

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  auth.setCredentials({ refresh_token: decryptSecret(connection.refreshToken) });
  const meet = google.meet({ version: "v2", auth });

  const lectures = await prisma.lecture.findMany({ where: { meetSpaceId: null } });
  console.log(`Lectures needing a Meet space: ${lectures.length}`);

  for (const lecture of lectures) {
    const { data } = await meet.spaces.create({
      requestBody: { config: { accessType: "OPEN", entryPointAccess: "ALL" } },
    });
    if (!data.name || !data.meetingUri) throw new Error(`Meet space creation failed for ${lecture.id}`);
    await prisma.lecture.update({
      where: { id: lecture.id },
      data: { meetUrl: data.meetingUri, meetSpaceId: data.name, googleEventId: null },
    });
    console.log(`  ${lecture.title} → ${data.meetingUri}`);
  }

  console.log("Done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
