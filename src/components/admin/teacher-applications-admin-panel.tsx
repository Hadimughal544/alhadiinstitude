"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import {
  updateTeacherApplicationStatusAction,
  deleteTeacherApplicationAction,
  bulkDeleteTeacherApplicationsAction,
} from "@/actions";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { DeleteRowButton } from "@/components/admin/delete-row-button";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { TeacherApplicationStatus } from "@/generated/prisma/client";

export type TeacherApplicationRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceSlug: string;
  subject: string | null;
  experience: string | null;
  message: string | null;
  status: TeacherApplicationStatus;
  createdAt: Date;
};

function StatusSelect({ id, status }: { id: string; status: TeacherApplicationStatus }) {
  const [pending, startTransition] = useTransition();
  return (
    <Select
      defaultValue={status}
      disabled={pending}
      className="h-9 w-36 text-xs"
      onChange={(event) => {
        const next = event.target.value as TeacherApplicationStatus;
        startTransition(() => {
          updateTeacherApplicationStatusAction(id, next);
        });
      }}
    >
      <option value="NEW">New</option>
      <option value="REVIEWED">Reviewed</option>
      <option value="CONTACTED">Contacted</option>
      <option value="REJECTED">Rejected</option>
    </Select>
  );
}

export function TeacherApplicationsAdminPanel({ applications }: { applications: TeacherApplicationRow[] }) {
  const columns: DataTableColumn<TeacherApplicationRow>[] = [
    {
      key: "contact",
      header: "Contact",
      render: (app) => (
        <div>
          <p className="font-medium">{app.name}</p>
          <p className="text-xs text-muted">{app.email}</p>
          <p className="text-xs text-muted">{app.phone}</p>
        </div>
      ),
    },
    {
      key: "service",
      header: "Service",
      className: "text-center",
      render: (app) => (
        <div className="capitalize">
          {app.serviceSlug}
          {app.subject && <p className="text-xs text-muted">{app.subject}</p>}
        </div>
      ),
    },
    {
      key: "experience",
      header: "Experience",
      render: (app) => (
        <p className="max-w-xs truncate text-xs text-muted" title={app.experience || undefined}>
          {app.experience || "—"}
        </p>
      ),
    },
    {
      key: "message",
      header: "Message",
      render: (app) => (
        <p className="max-w-xs truncate text-xs text-muted" title={app.message || undefined}>
          {app.message || "—"}
        </p>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (app) => <StatusSelect id={app.id} status={app.status} />,
    },
    {
      key: "date",
      header: "Date",
      className: "text-center",
      render: (app) => <span className="text-xs text-muted">{app.createdAt.toLocaleString()}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (app) => (
        <DeleteRowButton
          id={app.id}
          action={deleteTeacherApplicationAction}
          title="Delete this application?"
          description={`This will permanently delete the application from ${app.name}. This cannot be undone.`}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teacher Applications"
        description="People who applied to join Al-Hadi Institute as a teacher/tutor from the public site."
        action={
          <Link href="/api/admin/teacher-applications/export">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-4 w-4" /> Download CSV
            </Button>
          </Link>
        }
      />

      <DataTable
        columns={columns}
        rows={applications}
        emptyLabel="No applications yet."
        selectable
        bulkAction={bulkDeleteTeacherApplicationsAction}
        bulkActionLabel="Delete selected"
        bulkConfirmTitle="Delete selected applications?"
      />
    </div>
  );
}
