import {
  DashboardGreeting,
  NextClassHero,
  PortalQuickActions,
  TodayAgenda,
  WeekAtAGlance,
} from "@/components/dashboard/portal-dashboard";
import { pickNextLecture } from "@/lib/timetable/display";
import { requireStudent } from "@/lib/auth-guards";
import { getStudentSchedule, todaysLectures } from "@/lib/timetable/queries";
import { timesInZoneLabel } from "@/lib/timetable/time";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const session = await requireStudent();
  const { timezone, lectures } = await getStudentSchedule(session.user.id);
  const today = todaysLectures(lectures, timezone);
  const nextLecture = pickNextLecture(today, "student");
  const name = session.user.name || "Student";

  return (
    <div className="space-y-8">
      <DashboardGreeting name={name} subtitle={timesInZoneLabel(timezone)} />
      <NextClassHero lecture={nextLecture} role="student" perspective="student" />
      <div className="grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-4">
          <h2 className="font-display text-lg font-semibold">Today&apos;s schedule</h2>
          <TodayAgenda lectures={today} perspective="student" />
        </section>
        <aside className="space-y-6">
          <div>
            <h2 className="mb-3 font-display text-lg font-semibold">Quick actions</h2>
            <PortalQuickActions perspective="student" />
          </div>
          <WeekAtAGlance lectures={lectures} href="/student/timetable" />
        </aside>
      </div>
    </div>
  );
}
