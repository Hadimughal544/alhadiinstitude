import { TodayLectures } from "@/components/dashboard/today-lectures";
import { requireTeacher } from "@/lib/auth-guards";
import { getInstituteTimezone, getLecturesForTeacher, todaysLectures } from "@/lib/timetable/queries";
import { timesInPakistanLabel } from "@/lib/timetable/time";

export const dynamic = "force-dynamic";

export default async function TeacherDashboardPage() {
  const session = await requireTeacher();
  const [lectures, timezone] = await Promise.all([
    getLecturesForTeacher(session.user.id),
    getInstituteTimezone(),
  ]);
  const today = todaysLectures(lectures, timezone);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Welcome{session.user.name ? `, ${session.user.name}` : ""}</h1>
        <p className="mt-1 text-sm text-muted">
          Join appears 5 minutes before class. Start the room so students can enter at the start time.{" "}
          {timesInPakistanLabel()}.
        </p>
      </div>
      <TodayLectures lectures={today} perspective="teacher" />
    </div>
  );
}
