import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { toCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const applications = await prisma.teacherApplication.findMany({
    orderBy: { createdAt: "desc" },
  });

  const csv = toCsv(
    ["Name", "Email", "Phone", "Service", "Subject", "Experience", "Message", "Status", "Created At"],
    applications.map((app) => [
      app.name,
      app.email,
      app.phone,
      app.serviceSlug,
      app.subject ?? "",
      app.experience ?? "",
      app.message ?? "",
      app.status,
      app.createdAt.toISOString(),
    ])
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="teacher-applications-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
