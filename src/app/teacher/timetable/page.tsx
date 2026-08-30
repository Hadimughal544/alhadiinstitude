import { WeekGrid } from "@/components/timetable/week-grid";
import { requireTeacher } from "@/lib/auth-guards";
import { getLecturesForTeacher } from "@/lib/timetable/queries";
import { timesInPakistanLabel } from "@/lib/timetable/time";

export const dynamic = "force-dynamic";

export default async function TeacherTimetablePage() {
  const session = await requireTeacher();
  const lectures = await getLecturesForTeacher(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Timetable</h1>
        <p className="mt-1 text-sm text-muted">{timesInPakistanLabel()}.</p>
      </div>
      <WeekGrid lectures={lectures} showJoin joinRole="teacher" />
    </div>
  );
}
