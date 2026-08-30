import { NextResponse } from "next/server";

/** Institute Google is no longer used for Meet. Teachers connect on /teacher/account. */
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  return NextResponse.redirect(new URL("/admin/settings", origin));
}
