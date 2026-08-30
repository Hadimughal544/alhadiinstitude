"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  createLectureAction,
  deleteLectureAction,
  updateLectureAction,
} from "@/actions/admin/lectures";
import { AdminModal } from "@/components/admin/admin-modal";
import { Button } from "@/components/ui/button";
import { WeekGrid } from "@/components/timetable/week-grid";
import { DAYS, timesInPakistanLabel } from "@/lib/timetable/time";
import type { TimetableLecture } from "@/lib/timetable/types";
import { toActionError } from "@/lib/action-result";

export type TimetableTeacherOption = { id: string; name: string; googleConnected: boolean };
export type TimetableStudentOption = { id: string; name: string };
export type TimetableServiceOption = { id: string; title: string };

export function TimetableAdminPanel({
  lectures,
  teachers,
  students,
  services,
}: {
  lectures: TimetableLecture[];
  teachers: TimetableTeacherOption[];
  students: TimetableStudentOption[];
  services: TimetableServiceOption[];
}) {
  const connectedTeachers = teachers.filter((teacher) => teacher.googleConnected);
  const canCreate = connectedTeachers.length > 0 && students.length > 0;
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Timetable</h1>
          <p className="mt-1 text-sm text-muted">
            Weekly repeating lectures. Each save creates or updates a Google Meet link.{" "}
            {timesInPakistanLabel()}.
          </p>
        </div>
        <button
          type="button"
          disabled={!canCreate}
          onClick={() => {
            setError(null);
            setOpen("create");
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-teal px-4 py-2 text-sm font-medium text-cream disabled:opacity-50 dark:bg-gold dark:text-ink"
        >
          <Plus className="h-4 w-4" /> Add lecture
        </button>
      </div>

      {connectedTeachers.length === 0 && (
        <p className="mt-4 rounded-2xl border border-gold/40 bg-gold/10 p-4 text-sm">
          Each teacher must connect Google Calendar on their Account page before you can assign
          them to a lecture. They will be the Meet host.
        </p>
      )}
      {connectedTeachers.length > 0 && students.length === 0 && (
        <p className="mt-4 rounded-2xl border border-foreground/10 bg-card p-4 text-sm text-muted">
          Add at least one student before creating a lecture.
        </p>
      )}

      <div className="mt-6">
        <WeekGrid lectures={lectures} onSelect={(lecture) => setOpen(lecture)} />
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
                defaultValue={
                  open === "create"
                    ? connectedTeachers[0]?.id
                    : open.teacherId
                }
                className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3"
              >
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id} disabled={!teacher.googleConnected}>
                    {teacher.name}
                    {teacher.googleConnected ? "" : " (Google not connected)"}
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
                    if (!confirm("Delete this lecture and its Google Calendar event?")) return;
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
