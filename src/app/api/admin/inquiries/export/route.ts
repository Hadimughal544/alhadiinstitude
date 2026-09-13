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

  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    include: { plan: true },
  });

  const csv = toCsv(
    ["Name", "Email", "Phone", "Service", "Plan", "Course", "Age Group", "Type", "Status", "Message", "Created At"],
    inquiries.map((inq) => [
      inq.name,
      inq.email,
      inq.phone,
      inq.serviceSlug,
      inq.plan?.name ?? "",
      inq.course ?? "",
      inq.ageGroup ?? "",
      inq.type,
      inq.status,
      inq.message ?? "",
      inq.createdAt.toISOString(),
    ])
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
