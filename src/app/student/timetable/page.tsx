import { WeekGrid } from "@/components/timetable/week-grid";
import { requireStudent } from "@/lib/auth-guards";
import { getStudentSchedule } from "@/lib/timetable/queries";
import { timesInZoneLabel } from "@/lib/timetable/time";

export const dynamic = "force-dynamic";

export default async function StudentTimetablePage() {
  const session = await requireStudent();
  const { timezone, lectures } = await getStudentSchedule(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Timetable</h1>
        <p className="mt-1 text-sm text-muted">{timesInZoneLabel(timezone)}.</p>
      </div>
      <WeekGrid lectures={lectures} showJoin joinRole="student" />
    </div>
  );
}
