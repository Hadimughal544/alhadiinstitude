"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import {
  createLectureAction,
  deleteLectureAction,
  regenerateLectureMeetAction,
  updateLectureAction,
} from "@/actions/admin/lectures";
import { AdminModal } from "@/components/admin/admin-modal";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select } from "@/components/ui/select";
import { WeekGrid } from "@/components/timetable/week-grid";
import { useServerAction } from "@/hooks/use-server-action";
import { DAYS, timesInPakistanLabel } from "@/lib/timetable/time";
import type { TimetableLecture } from "@/lib/timetable/types";
import { cn } from "@/lib/utils";

export type TimetableTeacherOption = { id: string; name: string };
export type TimetableStudentOption = { id: string; name: string };
export type TimetableServiceOption = { id: string; title: string };

function StudentMultiSelect({
  students,
  selectedIds,
  onChange,
}: {
  students: TimetableStudentOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = students.filter((student) => selectedIds.includes(student.id));

  function toggle(id: string) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((s) => s !== id) : [...selectedIds, id]);
  }

  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((student) => (
            <Badge key={student.id} variant="outline" className="gap-1 pr-1">
              {student.name}
              <button
                type="button"
                onClick={() => toggle(student.id)}
                className="rounded-full p-0.5 hover:bg-foreground/10"
                aria-label={`Remove ${student.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between font-normal"
          >
            {selected.length > 0 ? `${selected.length} student${selected.length === 1 ? "" : "s"} selected` : "Select students"}
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="z-90 w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search students..." />
            <CommandList>
              <CommandEmpty>No students found.</CommandEmpty>
              <CommandGroup>
                {students.map((student) => {
                  const isSelected = selectedIds.includes(student.id);
                  return (
                    <CommandItem
                      key={student.id}
                      value={student.name}
                      onSelect={() => toggle(student.id)}
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded border border-border",
                          isSelected && "border-teal bg-teal text-cream dark:border-gold dark:bg-gold dark:text-ink"
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </span>
                      {student.name}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {/* Mirrors the server action's expected `formData.getAll("studentIds")` shape. */}
      {selectedIds.map((id) => (
        <input key={id} type="checkbox" name="studentIds" value={id} checked readOnly hidden />
      ))}
    </div>
  );
}

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
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const close = () => {
    setOpen(null);
    router.refresh();
  };

  const save = useServerAction((formData) =>
    open === "create" ? createLectureAction(formData) : updateLectureAction(formData)
  );
  const regenerate = useServerAction(async () => {
    if (!open || open === "create") return { ok: false, error: "No lecture selected." };
    return regenerateLectureMeetAction(open.id);
  });
  const remove = useServerAction(async () => {
    if (!open || open === "create") return { ok: false, error: "No lecture selected." };
    return deleteLectureAction(open.id);
  });

  const pending = save.pending || regenerate.pending || remove.pending;
  const error = save.error || regenerate.error || remove.error;

  function openLecture(lecture: "create" | TimetableLecture) {
    save.reset();
    regenerate.reset();
    remove.reset();
    setSelectedStudentIds(lecture === "create" ? [] : lecture.studentIds);
    setOpen(lecture);
  }

  return (
    <div>
      <PageHeader
        title="Timetable"
        description={`Weekly repeating lectures. Each lecture gets one open Google Meet link. ${timesInPakistanLabel()}.`}
        action={
          <Button type="button" disabled={!canCreate} onClick={() => openLecture("create")}>
            <Plus className="h-4 w-4" /> Add lecture
          </Button>
        }
      />

      {!instituteGoogleConnected && (
        <p className="mt-4 rounded-2xl border border-gold/40 bg-gold/10 p-4 text-sm">
          Connect the institute Google account in{" "}
          <Link href="/admin/settings/google" className="font-medium underline">
            Settings → Google
          </Link>{" "}
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
          onSelect={(lecture) => openLecture(lecture)}
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
              save.run(formData, close);
            }}
          >
            {open !== "create" && <input type="hidden" name="id" value={open.id} />}
            <div className="space-y-1.5">
              <Label htmlFor="lecture-title">Title</Label>
              <Input
                id="lecture-title"
                name="title"
                required
                defaultValue={open === "create" ? "" : open.title}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="lecture-day">Day</Label>
                <Select
                  id="lecture-day"
                  name="dayOfWeek"
                  defaultValue={open === "create" ? "1" : String(open.dayOfWeek)}
                >
                  {DAYS.map((day, index) => (
                    <option key={day} value={index}>
                      {day}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lecture-start">Start</Label>
                <Input
                  id="lecture-start"
                  name="startTime"
                  type="time"
                  required
                  defaultValue={open === "create" ? "16:00" : open.startTime}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lecture-end">End</Label>
                <Input
                  id="lecture-end"
                  name="endTime"
                  type="time"
                  required
                  defaultValue={open === "create" ? "16:45" : open.endTime}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lecture-teacher">Teacher</Label>
              <Select
                id="lecture-teacher"
                name="teacherId"
                required
                defaultValue={open === "create" ? teachers[0]?.id : open.teacherId}
              >
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lecture-service">Service (optional)</Label>
              <Select
                id="lecture-service"
                name="serviceId"
                defaultValue={open === "create" ? "" : open.serviceId ?? ""}
              >
                <option value="">None</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.title}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Students</Label>
              <StudentMultiSelect
                students={students}
                selectedIds={selectedStudentIds}
                onChange={setSelectedStudentIds}
              />
            </div>
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
                  onClick={() => setConfirmRegenerate(true)}
                >
                  Regenerate link
                </Button>
              </div>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={pending}>
                {save.pending ? "Saving..." : open === "create" ? "Create lecture" : "Save lecture"}
              </Button>
              {open !== "create" && (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={pending}
                  onClick={() => setConfirmDelete(true)}
                >
                  Delete
                </Button>
              )}
            </div>
          </form>
        )}
      </AdminModal>

      <ConfirmDialog
        open={confirmRegenerate}
        onOpenChange={setConfirmRegenerate}
        title="Generate a new Meet link?"
        description="The old link will stop being shown."
        confirmLabel="Regenerate"
        pending={regenerate.pending}
        onConfirm={() => {
          regenerate.run(new FormData(), () => {
            setConfirmRegenerate(false);
            close();
          });
        }}
      />
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this lecture?"
        confirmLabel="Delete"
        pending={remove.pending}
        onConfirm={() => {
          remove.run(new FormData(), () => {
            setConfirmDelete(false);
            close();
          });
        }}
      />
    </div>
  );
}
