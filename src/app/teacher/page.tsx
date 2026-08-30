import {
  DashboardGreeting,
  NextClassHero,
  PortalQuickActions,
  TodayAgenda,
  WeekAtAGlance,
} from "@/components/dashboard/portal-dashboard";
import { pickNextLecture } from "@/lib/timetable/display";
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
  const nextLecture = pickNextLecture(today, "teacher");
  const name = session.user.name || "Teacher";

  return (
    <div className="space-y-8">
      <DashboardGreeting name={name} subtitle={timesInPakistanLabel()} />
      <NextClassHero lecture={nextLecture} role="teacher" perspective="teacher" />
      <div className="grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-4">
          <h2 className="font-display text-lg font-semibold">Today&apos;s schedule</h2>
          <TodayAgenda lectures={today} perspective="teacher" />
        </section>
        <aside className="space-y-6">
          <div>
            <h2 className="mb-3 font-display text-lg font-semibold">Quick actions</h2>
            <PortalQuickActions perspective="teacher" />
          </div>
          <WeekAtAGlance lectures={lectures} href="/teacher/timetable" />
        </aside>
      </div>
    </div>
  );
}
