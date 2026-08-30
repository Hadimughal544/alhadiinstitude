import "server-only";

import { randomUUID } from "crypto";
import { google } from "googleapis";
import { getGoogleOAuthClient } from "@/lib/meet/google-oauth";
import type {
  CreateLectureEventInput,
  MeetEvent,
  MeetProvider,
  UpdateLectureEventInput,
} from "@/lib/meet/types";
import { DAYS, nextDateForWeekday } from "@/lib/timetable/time";

function calendarClient(refreshToken: string) {
  const auth = getGoogleOAuthClient("teacher");
  auth.setCredentials({ refresh_token: refreshToken });
  return google.calendar({ version: "v3", auth });
}

function googleApiMessage(error: unknown): string {
  const responseData = (error as { response?: { data?: { error?: { message?: string } } } })
    .response?.data?.error?.message;
  if (responseData) return responseData;
  if (error instanceof Error && error.message) return error.message;
  return "Google Calendar request failed.";
}

function throwGoogleApiError(error: unknown): never {
  const message = googleApiMessage(error);
  if (message.toLowerCase().includes("insufficient authentication scopes")) {
    throw new Error(
      "Google Calendar is missing Meet permission. The teacher should reconnect Google on their Account page and accept Calendar access."
    );
  }
  throw new Error(message);
}

function eventDateTimes(input: CreateLectureEventInput) {
  const date = nextDateForWeekday(input.dayOfWeek, input.timezone);
  return {
    start: { dateTime: `${date}T${input.startTime}:00`, timeZone: input.timezone },
    end: { dateTime: `${date}T${input.endTime}:00`, timeZone: input.timezone },
  };
}

function eventBody(input: CreateLectureEventInput) {
  const { start, end } = eventDateTimes(input);
  return {
    summary: input.title,
    description:
      input.description ||
      `Al-Hadi Institute class · ${DAYS[input.dayOfWeek]} ${input.startTime}–${input.endTime}`,
    start,
    end,
    recurrence: ["RRULE:FREQ=WEEKLY"],
    guestsCanModify: false,
  };
}

function toMeetEvent(event: {
  id?: string | null;
  hangoutLink?: string | null;
  conferenceData?: {
    entryPoints?: Array<{ entryPointType?: string | null; uri?: string | null }>;
  };
}): MeetEvent {
  const googleEventId = event.id;
  const meetUrl =
    event.hangoutLink ||
    event.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")
      ?.uri ||
    null;

  if (!googleEventId || !meetUrl) {
    throw new Error("Google Calendar did not return a Meet link. Check the connected account and try again.");
  }

  return { googleEventId, meetUrl };
}

export function createGoogleMeetProvider(refreshToken: string): MeetProvider {
  const calendar = calendarClient(refreshToken);

  return {
    async createLectureEvent(input) {
      try {
        const response = await calendar.events.insert({
          calendarId: "primary",
          conferenceDataVersion: 1,
          sendUpdates: "none",
          requestBody: {
            ...eventBody(input),
            conferenceData: {
              createRequest: {
                requestId: randomUUID(),
                conferenceSolutionKey: { type: "hangoutsMeet" },
              },
            },
          },
        });
        return toMeetEvent(response.data);
      } catch (error) {
        throwGoogleApiError(error);
      }
    },

    async updateLectureEvent(input: UpdateLectureEventInput) {
      let response;
      try {
        response = await calendar.events.patch({
          calendarId: "primary",
          eventId: input.googleEventId,
          conferenceDataVersion: 1,
          sendUpdates: "none",
          requestBody: eventBody(input),
        });
      } catch (error) {
        throwGoogleApiError(error);
      }

      try {
        return toMeetEvent(response.data);
      } catch {
        return {
          googleEventId: input.googleEventId,
          meetUrl:
            response.data.hangoutLink ||
            "",
        };
      }
    },

    async deleteLectureEvent(googleEventId) {
      try {
        await calendar.events.delete({
          calendarId: "primary",
          eventId: googleEventId,
          sendUpdates: "none",
        });
      } catch (error) {
        const status = (error as { code?: number }).code;
        if (status === 404 || status === 410) return;
        throw error;
      }
    },
  };
}
