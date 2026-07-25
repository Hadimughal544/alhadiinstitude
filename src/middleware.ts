import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { COUNTRY_COOKIE, isExemptFromCountryGate } from "@/lib/constants";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (isExemptFromCountryGate(pathname)) {
    return NextResponse.next();
  }

  const country = req.cookies.get(COUNTRY_COOKIE)?.value;
  if (!country) {
    const url = new URL("/", req.nextUrl);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
