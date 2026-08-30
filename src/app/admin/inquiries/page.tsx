import { updateInquiryStatusAction } from "@/actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataListRow } from "@/components/dashboard/data-list-row";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import type { InquiryStatus } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

function statusVariant(status: string) {
  if (status === "NEW") return "info" as const;
  if (status === "CONTACTED") return "warning" as const;
  return "outline" as const;
}

export default async function AdminInquiriesPage() {
  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    include: { plan: true },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inquiries"
        description="Leads from the public site — demo requests, enrollments, and contact forms."
      />

      <div className="hidden overflow-hidden rounded-xl border border-border lg:block">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-accent/30 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Service</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inq) => (
              <tr key={inq.id} className="border-t border-border align-top hover:bg-accent/20">
                <td className="px-4 py-3">
                  <p className="font-medium">{inq.name}</p>
                  <p className="text-xs text-muted">{inq.email}</p>
                  <p className="text-xs text-muted">{inq.phone}</p>
                </td>
                <td className="px-4 py-3 capitalize">
                  {inq.serviceSlug}
                  {inq.plan && <p className="text-xs text-muted">{inq.plan.name}</p>}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{inq.type}</Badge>
                </td>
                <td className="px-4 py-3">
                  <form
                    action={async (fd) => {
                      "use server";
                      await updateInquiryStatusAction(
                        inq.id,
                        String(fd.get("status")) as InquiryStatus
                      );
                    }}
                    className="flex items-center gap-2"
                  >
                    <Select name="status" defaultValue={inq.status} className="h-9 w-36 text-xs">
                      <option value="NEW">New</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="CLOSED">Closed</option>
                    </Select>
                    <button type="submit" className="text-xs font-medium text-teal dark:text-gold">
                      Save
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3 text-xs text-muted">
                  {inq.createdAt.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2 lg:hidden">
        {inquiries.map((inq) => (
          <Card key={inq.id}>
            <CardContent className="p-4">
              <DataListRow
                name={inq.name}
                subtitle={inq.email}
                meta={`${inq.serviceSlug} · ${inq.type}`}
                badge={inq.status}
                badgeVariant={statusVariant(inq.status)}
              />
              <form
                action={async (fd) => {
                  "use server";
                  await updateInquiryStatusAction(
                    inq.id,
                    String(fd.get("status")) as InquiryStatus
                  );
                }}
                className="mt-3 flex items-center gap-2"
              >
                <Select name="status" defaultValue={inq.status} className="h-9 flex-1 text-xs">
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="CLOSED">Closed</option>
                </Select>
                <button type="submit" className="text-xs font-medium text-teal dark:text-gold">
                  Save
                </button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
