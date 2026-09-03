import "server-only";

import { google, type meet_v2 } from "googleapis";
import { getGoogleOAuthClient } from "@/lib/meet/google-oauth";
import type { InstituteMeetProvider, OpenMeetSpace } from "@/lib/meet/types";

function meetClient(refreshToken: string): meet_v2.Meet {
  const auth = getGoogleOAuthClient();
  auth.setCredentials({ refresh_token: refreshToken });
  return google.meet({ version: "v2", auth });
}

function toOpenSpace(data: meet_v2.Schema$Space): OpenMeetSpace {
  if (!data.name || !data.meetingUri) {
    throw new Error(
      "Google Meet did not return a room link. Reconnect the institute Google account and try again."
    );
  }
  return {
    meetUrl: data.meetingUri,
    spaceId: data.name,
    meetingCode: data.meetingCode ?? null,
  };
}

function googleApiMessage(error: unknown): string {
  const responseMessage = (error as { response?: { data?: { error?: { message?: string } } } })
    .response?.data?.error?.message;
  if (responseMessage) return responseMessage;
  if (error instanceof Error && error.message) return error.message;
  return "Google Meet request failed.";
}

function throwMeetApiError(error: unknown): never {
  const message = googleApiMessage(error);
  const lower = message.toLowerCase();
  if (lower.includes("insufficient authentication scopes") || message.includes("ACCESS_TOKEN_SCOPE_INSUFFICIENT")) {
    throw new Error(
      "The institute Google account is missing Meet permission. Open Admin → Settings → Google, click Reconnect, and accept the Google Meet access."
    );
  }
  if (message.includes("Meet API has not been used") || message.includes("SERVICE_DISABLED")) {
    throw new Error(
      "Enable the Google Meet API in Google Cloud Console for this project, then try again."
    );
  }
  throw new Error(message);
}

export function createMeetSpaceProvider(refreshToken: string): InstituteMeetProvider {
  const meet = meetClient(refreshToken);

  return {
    async createOpenSpace() {
      try {
        const response = await meet.spaces.create({
          requestBody: {
            config: {
              accessType: "OPEN",
              entryPointAccess: "ALL",
            },
          },
        });
        return toOpenSpace(response.data);
      } catch (error) {
        throwMeetApiError(error);
      }
    },

    async getSpace(spaceId) {
      try {
        const response = await meet.spaces.get({ name: spaceId });
        return toOpenSpace(response.data);
      } catch (error) {
        if ((error as { code?: number }).code === 404) return null;
        throwMeetApiError(error);
      }
    },

    async endActiveConference(spaceId) {
      try {
        await meet.spaces.endActiveConference({ name: spaceId });
      } catch (error) {
        const code = (error as { code?: number }).code;
        if (code === 404 || code === 409) return; // no live conference to end
        throw error;
      }
    },
  };
}
