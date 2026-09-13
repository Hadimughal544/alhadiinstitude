import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guards";
import { listAttendanceRecords } from "@/lib/attendance/queries";
import { toCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const records = await listAttendanceRecords();

  const csv = toCsv(
    ["Lecture", "Role", "Name", "Email", "Date", "Joined At"],
    records.map((r) => [
      r.lectureTitle,
      r.role,
      r.personName,
      r.personEmail,
      r.occurredOn,
      r.joinedAt.toISOString(),
    ])
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="attendance-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
