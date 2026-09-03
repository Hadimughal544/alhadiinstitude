import "server-only";

import { google } from "googleapis";

function appOrigin() {
  return (process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000").replace(
    /\/$/,
    ""
  );
}

export function getGoogleRedirectUri() {
  return process.env.GOOGLE_REDIRECT_URI || `${appOrigin()}/api/admin/google/callback`;
}

export function getGoogleOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.");
  }

  return new google.auth.OAuth2(clientId, clientSecret, getGoogleRedirectUri());
}

/**
 * The institute account connects once. `meetings.space.created` is the only
 * capability we need: it lets us create Meet spaces (open meeting rooms) owned
 * by the institute. No Calendar scope — classes live in the app's own timetable.
 */
export const GOOGLE_MEET_SPACE_SCOPE = "https://www.googleapis.com/auth/meetings.space.created";

export const GOOGLE_INSTITUTE_SCOPES = [GOOGLE_MEET_SPACE_SCOPE, "openid", "email"];
