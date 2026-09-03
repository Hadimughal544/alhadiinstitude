import { WeekGrid } from "@/components/timetable/week-grid";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireTeacher } from "@/lib/auth-guards";
import { getLecturesForTeacher } from "@/lib/timetable/queries";
import { timesInPakistanLabel } from "@/lib/timetable/time";

export const dynamic = "force-dynamic";

export default async function TeacherTimetablePage() {
  const session = await requireTeacher();
  const lectures = await getLecturesForTeacher(session.user.id);

  return (
    <div className="space-y-6">
      <PageHeader title="Timetable" description={timesInPakistanLabel()} />
      <WeekGrid lectures={lectures} showJoin joinRole="teacher" showStudents />
    </div>
  );
}
