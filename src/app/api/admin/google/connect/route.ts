import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { auth } from "@/lib/auth";
import { GOOGLE_INSTITUTE_SCOPES, getGoogleOAuthClient } from "@/lib/meet/google-oauth";

export async function GET(request: Request) {
  const session = await auth();
  const origin = new URL(request.url).origin;
  if (!session?.user || session.user.role !== "ADMIN") {
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("callbackUrl", "/admin/settings/google");
    return NextResponse.redirect(loginUrl);
  }

  const state = randomBytes(16).toString("hex");
  const oauth = getGoogleOAuthClient();
  const url = oauth.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: false,
    scope: GOOGLE_INSTITUTE_SCOPES,
    state,
  });

  const response = NextResponse.redirect(url);
  response.cookies.set("google_admin_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  });
  return response;
}
