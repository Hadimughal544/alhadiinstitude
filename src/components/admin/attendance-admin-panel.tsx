"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import {
  deleteAttendanceRecordAction,
  bulkDeleteAttendanceRecordsAction,
} from "@/actions/attendance";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { DeleteRowButton } from "@/components/admin/delete-row-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Role } from "@/generated/prisma/client";

export type AttendanceRow = {
  id: string;
  personName: string;
  personEmail: string;
  role: Role;
  lectureTitle: string;
  occurredOn: string;
  joinedAt: Date;
};

export function AttendanceAdminPanel({ records }: { records: AttendanceRow[] }) {
  const columns: DataTableColumn<AttendanceRow>[] = [
    {
      key: "lecture",
      header: "Lecture",
      render: (r) => (
        <div>
          <p className="font-medium">{r.lectureTitle}</p>
          <p className="text-xs text-muted">{r.occurredOn}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      className: "text-center",
      render: (r) => <Badge variant={r.role === "TEACHER" ? "teal" : "outline"}>{r.role}</Badge>,
    },
    {
      key: "person",
      header: "Name",
      render: (r) => (
        <div>
          <p className="font-medium">{r.personName}</p>
          <p className="text-xs text-muted">{r.personEmail}</p>
        </div>
      ),
    },
    {
      key: "joinedAt",
      header: "Joined At",
      className: "text-center",
      render: (r) => <span className="text-xs text-muted">{r.joinedAt.toLocaleString()}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (r) => (
        <DeleteRowButton
          id={r.id}
          action={deleteAttendanceRecordAction}
          title="Delete this attendance record?"
          description={`This will permanently delete ${r.personName}'s attendance record for "${r.lectureTitle}". This cannot be undone.`}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Who clicked Join for each class, and when. This reflects join-link clicks, not verified time spent in the call."
        action={
          <Link href="/api/admin/attendance/export">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-4 w-4" /> Download CSV
            </Button>
          </Link>
        }
      />

      <DataTable
        columns={columns}
        rows={records}
        emptyLabel="No attendance recorded yet."
        selectable
        bulkAction={bulkDeleteAttendanceRecordsAction}
        bulkActionLabel="Delete selected"
        bulkConfirmTitle="Delete selected attendance records?"
      />
    </div>
  );
}
