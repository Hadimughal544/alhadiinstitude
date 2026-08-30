import "server-only";

import { prisma } from "@/lib/prisma";
import { createGoogleMeetProvider } from "@/lib/meet/google-calendar";
import type { MeetProvider } from "@/lib/meet/types";

export type { MeetProvider, MeetEvent } from "@/lib/meet/types";

export async function getGoogleConnectionForUser(userId: string) {
  return prisma.googleConnection.findUnique({
    where: { userId },
  });
}

export async function getMeetProviderForTeacher(userId: string): Promise<MeetProvider> {
  const connection = await getGoogleConnectionForUser(userId);
  if (!connection) {
    throw new Error(
      "This teacher has not connected Google Calendar. Ask them to connect it on their Account page first."
    );
  }
  return createGoogleMeetProvider(connection.refreshToken);
}
