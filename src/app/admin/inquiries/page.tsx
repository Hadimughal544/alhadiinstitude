import { updateInquiryStatusAction } from "@/actions";
import { prisma } from "@/lib/prisma";
import type { InquiryStatus } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    include: { plan: true },
    take: 100,
  });

  return (
    <div>
      <h1 className="font-display text-3xl">Inquiries</h1>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-foreground/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-foreground/5 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inq) => (
              <tr key={inq.id} className="border-t border-foreground/5 align-top">
                <td className="px-4 py-3">
                  <p className="font-medium">{inq.name}</p>
                  {inq.course && <p className="text-xs text-muted">{inq.course}</p>}
                  {inq.message && (
                    <p className="mt-1 max-w-xs text-xs text-muted line-clamp-2">{inq.message}</p>
                  )}
                </td>
                <td className="px-4 py-3 capitalize">
                  {inq.serviceSlug}
                  {inq.plan && <p className="text-xs text-muted">{inq.plan.name}</p>}
                </td>
                <td className="px-4 py-3">
                  <p>{inq.email}</p>
                  <p className="text-xs text-muted">{inq.phone}</p>
                  {inq.countryCode && <p className="text-xs text-muted">{inq.countryCode}</p>}
                </td>
                <td className="px-4 py-3">{inq.type}</td>
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
                    <select
                      name="status"
                      defaultValue={inq.status}
                      className="h-9 rounded-lg border border-foreground/15 bg-background px-2 text-sm"
                    >
                      <option value="NEW">NEW</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                    <button type="submit" className="text-xs text-teal underline dark:text-gold">
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
    </div>
  );
}
