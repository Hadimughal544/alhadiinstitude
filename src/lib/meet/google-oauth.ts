import "server-only";

import { google } from "googleapis";

export type GoogleOAuthAudience = "admin" | "teacher";

function appOrigin() {
  return (process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000").replace(
    /\/$/,
    ""
  );
}

export function getGoogleRedirectUri(audience: GoogleOAuthAudience = "teacher") {
  if (audience === "teacher") {
    return (
      process.env.GOOGLE_TEACHER_REDIRECT_URI ||
      `${appOrigin()}/api/teacher/google/callback`
    );
  }
  return process.env.GOOGLE_REDIRECT_URI || `${appOrigin()}/api/admin/google/callback`;
}

export function getGoogleOAuthClient(audience: GoogleOAuthAudience = "teacher") {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.");
  }

  return new google.auth.OAuth2(clientId, clientSecret, getGoogleRedirectUri(audience));
}

/** Full calendar access is required to attach a Google Meet conference to an event. */
export const GOOGLE_CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "openid",
  "email",
];
