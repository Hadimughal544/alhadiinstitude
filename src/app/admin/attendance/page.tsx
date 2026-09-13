import { AttendanceAdminPanel } from "@/components/admin/attendance-admin-panel";
import { listAttendanceRecords } from "@/lib/attendance/queries";

export const dynamic = "force-dynamic";

export default async function AdminAttendancePage() {
  const records = await listAttendanceRecords();

  return <AttendanceAdminPanel records={records} />;
}
