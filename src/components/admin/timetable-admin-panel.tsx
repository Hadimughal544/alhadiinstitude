"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  createLectureAction,
  deleteLectureAction,
  regenerateLectureMeetAction,
  updateLectureAction,
} from "@/actions/admin/lectures";
import { AdminModal } from "@/components/admin/admin-modal";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { WeekGrid } from "@/components/timetable/week-grid";
import { DAYS, timesInPakistanLabel } from "@/lib/timetable/time";
import type { TimetableLecture } from "@/lib/timetable/types";
import { toActionError } from "@/lib/action-result";

export type TimetableTeacherOption = { id: string; name: string };
export type TimetableStudentOption = { id: string; name: string };
export type TimetableServiceOption = { id: string; title: string };

export function TimetableAdminPanel({
  lectures,
  teachers,
  students,
  services,
  instituteGoogleConnected,
}: {
  lectures: TimetableLecture[];
  teachers: TimetableTeacherOption[];
  students: TimetableStudentOption[];
  services: TimetableServiceOption[];
  instituteGoogleConnected: boolean;
}) {
  const canCreate = instituteGoogleConnected && teachers.length > 0 && students.length > 0;
  const router = useRouter();
  const [open, setOpen] = useState<"create" | TimetableLecture | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const close = () => {
    setOpen(null);
    setError(null);
    router.refresh();
  };

  const selectedStudentIds = useMemo(() => {
    if (!open || open === "create") return [] as string[];
    return open.studentIds;
  }, [open]);

  return (
    <div>
      <PageHeader
        title="Timetable"
        description={`Weekly repeating lectures. Each lecture gets one open Google Meet link. ${timesInPakistanLabel()}.`}
        action={
          <Button
            type="button"
            disabled={!canCreate}
            onClick={() => {
              setError(null);
              setOpen("create");
            }}
          >
            <Plus className="h-4 w-4" /> Add lecture
          </Button>
        }
      />

      {!instituteGoogleConnected && (
        <p className="mt-4 rounded-2xl border border-gold/40 bg-gold/10 p-4 text-sm">
          Connect the institute Google account in{" "}
          <a href="/admin/settings/google" className="font-medium underline">
            Settings → Google
          </a>{" "}
          before creating lectures. Every class Meet link is created there.
        </p>
      )}
      {instituteGoogleConnected && teachers.length === 0 && (
        <p className="mt-4 rounded-2xl border border-foreground/10 bg-card p-4 text-sm text-muted">
          Add at least one teacher before creating a lecture.
        </p>
      )}
      {instituteGoogleConnected && teachers.length > 0 && students.length === 0 && (
        <p className="mt-4 rounded-2xl border border-foreground/10 bg-card p-4 text-sm text-muted">
          Add at least one student before creating a lecture.
        </p>
      )}

      <div className="mt-6">
        <WeekGrid
          lectures={lectures}
          onSelect={(lecture) => setOpen(lecture)}
          showJoin
          joinRole="admin"
          showStudents
        />
      </div>

      <AdminModal
        open={open !== null}
        onClose={close}
        title={open === "create" ? "Add lecture" : "Edit lecture"}
        wide
      >
        {open && (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              setError(null);
              startTransition(async () => {
                try {
                  const result =
                    open === "create"
                      ? await createLectureAction(formData)
                      : await updateLectureAction(formData);
                  if (!result.ok) {
                    setError(result.error);
                    return;
                  }
                  close();
                } catch (e) {
                  setError(toActionError(e));
                }
              });
            }}
          >
            {open !== "create" && <input type="hidden" name="id" value={open.id} />}
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Title</span>
              <input
                name="title"
                required
                defaultValue={open === "create" ? "" : open.title}
                className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium">Day</span>
                <select
                  name="dayOfWeek"
                  defaultValue={open === "create" ? "1" : String(open.dayOfWeek)}
                  className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3"
                >
                  {DAYS.map((day, index) => (
                    <option key={day} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium">Start</span>
                <input
                  name="startTime"
                  type="time"
                  required
                  defaultValue={open === "create" ? "16:00" : open.startTime}
                  className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium">End</span>
                <input
                  name="endTime"
                  type="time"
                  required
                  defaultValue={open === "create" ? "16:45" : open.endTime}
                  className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3"
                />
              </label>
            </div>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Teacher</span>
              <select
                name="teacherId"
                required
                defaultValue={open === "create" ? teachers[0]?.id : open.teacherId}
                className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3"
              >
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Service (optional)</span>
              <select
                name="serviceId"
                defaultValue={open === "create" ? "" : open.serviceId ?? ""}
                className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3"
              >
                <option value="">None</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.title}
                  </option>
                ))}
              </select>
            </label>
            <fieldset className="block text-sm">
              <legend className="mb-1.5 font-medium">Students</legend>
              <div className="grid max-h-56 gap-2 overflow-y-auto rounded-xl border border-foreground/10 p-3 sm:grid-cols-2">
                {students.map((student) => (
                  <label key={student.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="studentIds"
                      value={student.id}
                      defaultChecked={selectedStudentIds.includes(student.id)}
                    />
                    <span>{student.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            {open !== "create" && (
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-foreground/10 bg-card p-3 text-sm">
                <span className="text-muted">
                  {open.meetUrl ? (
                    <>
                      Meet link:{" "}
                      <a
                        href={open.meetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        {open.meetUrl.replace("https://", "")}
                      </a>
                    </>
                  ) : (
                    "No Meet link yet."
                  )}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={() => {
                    if (!confirm("Generate a new Meet link? The old link will stop being shown.")) return;
                    setError(null);
                    startTransition(async () => {
                      const result = await regenerateLectureMeetAction(open.id);
                      if (!result.ok) {
                        setError(result.error);
                        return;
                      }
                      close();
                    });
                  }}
                >
                  Regenerate link
                </Button>
              </div>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : open === "create" ? "Create lecture" : "Save lecture"}
              </Button>
              {open !== "create" && (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={pending}
                  onClick={() => {
                    if (!confirm("Delete this lecture?")) return;
                    startTransition(async () => {
                      const result = await deleteLectureAction(open.id);
                      if (!result.ok) {
                        setError(result.error);
                        return;
                      }
                      close();
                    });
                  }}
                >
                  Delete
                </Button>
              )}
            </div>
          </form>
        )}
      </AdminModal>
    </div>
  );
}
