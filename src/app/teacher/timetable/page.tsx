import { WeekGrid } from "@/components/timetable/week-grid";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireTeacher } from "@/lib/auth-guards";
import { getTeacherSchedule } from "@/lib/timetable/queries";
import { timesInZoneLabel } from "@/lib/timetable/time";

export const dynamic = "force-dynamic";

export default async function TeacherTimetablePage() {
  const session = await requireTeacher();
  const { timezone, lectures } = await getTeacherSchedule(session.user.id);

  return (
    <div className="space-y-6">
      <PageHeader title="Timetable" description={timesInZoneLabel(timezone)} />
      <WeekGrid lectures={lectures} showJoin joinRole="teacher" showStudents timezone={timezone} />
    </div>
  );
}
