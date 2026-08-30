import { TodayLectures } from "@/components/dashboard/today-lectures";
import { requireStudent } from "@/lib/auth-guards";
import { getStudentSchedule, todaysLectures } from "@/lib/timetable/queries";
import { timesInZoneLabel } from "@/lib/timetable/time";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const session = await requireStudent();
  const { timezone, lectures } = await getStudentSchedule(session.user.id);
  const today = todaysLectures(lectures, timezone);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Welcome{session.user.name ? `, ${session.user.name}` : ""}</h1>
        <p className="mt-1 text-sm text-muted">
          The join link appears at the class start time. {timesInZoneLabel(timezone)}.
        </p>
      </div>
      <TodayLectures lectures={today} perspective="student" />
    </div>
  );
}
