import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { google } from "googleapis";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getGoogleOAuthClient } from "@/lib/meet/google-oauth";

function accountUrl(origin: string, googleStatus?: string) {
  const url = new URL("/teacher/account", origin);
  if (googleStatus) url.searchParams.set("google", googleStatus);
  return url;
}

export async function GET(request: Request) {
  const session = await auth();
  const url = new URL(request.url);
  const origin = url.origin;

  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.redirect(accountUrl(origin, "error"));
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const jar = await cookies();
  const cookieState = jar.get("google_teacher_oauth_state")?.value;

  if (url.searchParams.get("error")) {
    return NextResponse.redirect(accountUrl(origin, "denied"));
  }

  if (!code || !state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(accountUrl(origin, "error"));
  }

  try {
    const oauth = getGoogleOAuthClient("teacher");
    const { tokens } = await oauth.getToken(code);
    if (!tokens.refresh_token) {
      return NextResponse.redirect(accountUrl(origin, "error"));
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
      return NextResponse.redirect(accountUrl(origin, "error"));
    }

    await prisma.googleConnection.upsert({
      where: { userId: session.user.id },
      update: {
        email,
        refreshToken: tokens.refresh_token,
        connectedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        email,
        refreshToken: tokens.refresh_token,
      },
    });

    const response = NextResponse.redirect(accountUrl(origin));
    response.cookies.set("google_teacher_oauth_state", "", { path: "/", maxAge: 0 });
    return response;
  } catch {
    return NextResponse.redirect(accountUrl(origin, "error"));
  }
}
