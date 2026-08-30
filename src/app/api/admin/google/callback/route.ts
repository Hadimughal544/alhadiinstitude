import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { google } from "googleapis";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptSecret } from "@/lib/crypto";
import { GOOGLE_MEET_SPACE_SCOPE, getGoogleOAuthClient } from "@/lib/meet/google-oauth";

function settingsUrl(origin: string, googleStatus?: string) {
  const url = new URL("/admin/settings/google", origin);
  if (googleStatus) url.searchParams.set("google", googleStatus);
  return url;
}

export async function GET(request: Request) {
  const session = await auth();
  const url = new URL(request.url);
  const origin = url.origin;

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.redirect(settingsUrl(origin, "error"));
  }

  if (url.searchParams.get("error")) {
    return NextResponse.redirect(settingsUrl(origin, "denied"));
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const jar = await cookies();
  const cookieState = jar.get("google_admin_oauth_state")?.value;

  if (!code || !state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(settingsUrl(origin, "error"));
  }

  try {
    const oauth = getGoogleOAuthClient();
    const { tokens } = await oauth.getToken(code);
    if (!tokens.refresh_token) {
      return NextResponse.redirect(settingsUrl(origin, "error"));
    }
    if (!(tokens.scope ?? "").includes(GOOGLE_MEET_SPACE_SCOPE)) {
      return NextResponse.redirect(settingsUrl(origin, "scope"));
    }

    let email = "";
    if (tokens.id_token) {
      const ticket = await oauth.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      email = ticket.getPayload()?.email || "";
    }
    if (!email) {
      oauth.setCredentials(tokens);
      const oauth2 = google.oauth2({ version: "v2", auth: oauth });
      const profile = await oauth2.userinfo.get();
      email = profile.data.email || "";
    }
    if (!email) {
      return NextResponse.redirect(settingsUrl(origin, "error"));
    }

    const refreshToken = encryptSecret(tokens.refresh_token);
    await prisma.googleConnection.upsert({
      where: { userId: session.user.id },
      update: { email, refreshToken, scope: tokens.scope ?? null, connectedAt: new Date() },
      create: { userId: session.user.id, email, refreshToken, scope: tokens.scope ?? null },
    });
    // Enforce a single institute connection.
    await prisma.googleConnection.deleteMany({ where: { userId: { not: session.user.id } } });

    const response = NextResponse.redirect(settingsUrl(origin, "connected"));
    response.cookies.set("google_admin_oauth_state", "", { path: "/", maxAge: 0 });
    return response;
  } catch {
    return NextResponse.redirect(settingsUrl(origin, "error"));
  }
}
