"use client";

import { useTransition } from "react";
import { Download } from "lucide-react";
import Link from "next/link";
import {
  updateInquiryStatusAction,
  deleteInquiryAction,
  bulkDeleteInquiriesAction,
} from "@/actions";
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { DeleteRowButton } from "@/components/admin/delete-row-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { InquiryStatus } from "@/generated/prisma/client";

export type InquiryRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceSlug: string;
  type: string;
  status: InquiryStatus;
  planName: string | null;
  createdAt: Date;
};

function StatusSelect({ id, status }: { id: string; status: InquiryStatus }) {
  const [pending, startTransition] = useTransition();
  return (
    <Select
      defaultValue={status}
      disabled={pending}
      className="h-9 w-36 text-xs"
      onChange={(event) => {
        const next = event.target.value as InquiryStatus;
        startTransition(() => {
          updateInquiryStatusAction(id, next);
        });
      }}
    >
      <option value="NEW">New</option>
      <option value="CONTACTED">Contacted</option>
      <option value="CLOSED">Closed</option>
    </Select>
  );
}

export function InquiriesAdminPanel({ inquiries }: { inquiries: InquiryRow[] }) {
  const columns: DataTableColumn<InquiryRow>[] = [
    {
      key: "contact",
      header: "Contact",
      render: (inq) => (
        <div>
          <p className="font-medium">{inq.name}</p>
          <p className="text-xs text-muted">{inq.email}</p>
          <p className="text-xs text-muted">{inq.phone}</p>
        </div>
      ),
    },
    {
      key: "service",
      header: "Service",
      className: "text-center",
      render: (inq) => (
        <div className="capitalize">
          {inq.serviceSlug}
          {inq.planName && <p className="text-xs text-muted">{inq.planName}</p>}
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      className: "text-center",
      render: (inq) => <Badge variant="outline">{inq.type}</Badge>,
    },
    {
      key: "status",
      header: "Status",
      render: (inq) => <StatusSelect id={inq.id} status={inq.status} />,
    },
    {
      key: "date",
      header: "Date",
      className: "text-center",
      render: (inq) => <span className="text-xs text-muted">{inq.createdAt.toLocaleString()}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (inq) => (
        <DeleteRowButton
          id={inq.id}
          action={deleteInquiryAction}
          title="Delete this inquiry?"
          description={`This will permanently delete the inquiry from ${inq.name}. This cannot be undone.`}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inquiries"
        description="Leads from the public site — demo requests, enrollments, and contact forms."
        action={
          <Link href="/api/admin/inquiries/export">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-4 w-4" /> Download CSV
            </Button>
          </Link>
        }
      />

      <DataTable
        columns={columns}
        rows={inquiries}
        emptyLabel="No inquiries yet."
        selectable
        bulkAction={bulkDeleteInquiriesAction}
        bulkActionLabel="Delete selected"
        bulkConfirmTitle="Delete selected inquiries?"
      />
    </div>
  );
}
