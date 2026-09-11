import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listSessionsWithAttendance } from "@/lib/attendance/queries";
import { formatTimeRange } from "@/lib/timetable/time";

export const dynamic = "force-dynamic";

function formatClock(date: Date | null) {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(date);
}

export default async function AdminAttendancePage() {
  const sessions = await listSessionsWithAttendance();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Who clicked Join for each class, and when. This reflects join-link clicks, not verified time spent in the call."
      />

      {sessions.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted">
          No attendance recorded yet.
        </p>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const joinedCount = session.students.filter((s) => s.joinedAt).length;
            return (
              <Card key={session.sessionId}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">{session.lectureTitle}</p>
                      <p className="text-xs text-muted">
                        {session.occurredOn} ·{" "}
                        {formatTimeRange(
                          formatClock(session.scheduledStart) || "",
                          formatClock(session.scheduledEnd) || ""
                        )}
                      </p>
                    </div>
                    <Badge variant={joinedCount === session.students.length && session.students.length > 0 ? "teal" : "outline"}>
                      {joinedCount}/{session.students.length} students joined
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-muted">Teacher:</span>
                    <span className="font-medium">{session.teacherName}</span>
                    {session.teacherJoinedAt ? (
                      <Badge variant="teal">Joined {formatClock(session.teacherJoinedAt)}</Badge>
                    ) : (
                      <Badge variant="outline">Not joined</Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {session.students.map((student) => (
                      <span
                        key={student.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs"
                      >
                        {student.name}
                        {student.joinedAt ? (
                          <span className="font-medium text-teal dark:text-gold">
                            {formatClock(student.joinedAt)}
                          </span>
                        ) : (
                          <span className="text-muted">absent</span>
                        )}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
