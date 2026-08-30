import "server-only";

import { prisma } from "@/lib/prisma";
import { decryptSecret } from "@/lib/crypto";
import { createMeetSpaceProvider } from "@/lib/meet/google-meet-space";
import { GOOGLE_MEET_SPACE_SCOPE } from "@/lib/meet/google-oauth";
import type { InstituteMeetProvider } from "@/lib/meet/types";

export type { InstituteMeetProvider, OpenMeetSpace } from "@/lib/meet/types";

/**
 * The institute connects one Google account. It is keyed on the connecting
 * admin's user id and kept a hard singleton by the OAuth callback, so the most
 * recent row is authoritative.
 */
export async function getInstituteGoogleConnection() {
  return prisma.googleConnection.findFirst({ orderBy: { connectedAt: "desc" } });
}

export async function isInstituteGoogleConnected(): Promise<boolean> {
  const connection = await getInstituteGoogleConnection();
  return !!connection && (connection.scope ?? "").includes(GOOGLE_MEET_SPACE_SCOPE);
}

export async function getInstituteMeetProvider(): Promise<InstituteMeetProvider> {
  const connection = await getInstituteGoogleConnection();
  if (!connection) {
    throw new Error(
      "The institute Google account is not connected. Connect it in Admin → Settings → Google."
    );
  }
  return createMeetSpaceProvider(decryptSecret(connection.refreshToken));
}
