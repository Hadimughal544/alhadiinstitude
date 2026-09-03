import { WeekGrid } from "@/components/timetable/week-grid";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireStudent } from "@/lib/auth-guards";
import { getStudentSchedule } from "@/lib/timetable/queries";
import { timesInZoneLabel } from "@/lib/timetable/time";

export const dynamic = "force-dynamic";

export default async function StudentTimetablePage() {
  const session = await requireStudent();
  const { timezone, lectures } = await getStudentSchedule(session.user.id);

  return (
    <div className="space-y-6">
      <PageHeader title="Timetable" description={timesInZoneLabel(timezone)} />
      <WeekGrid lectures={lectures} showJoin joinRole="student" timezone={timezone} />
    </div>
  );
}
