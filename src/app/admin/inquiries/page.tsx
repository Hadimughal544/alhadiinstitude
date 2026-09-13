import { InquiriesAdminPanel, type InquiryRow } from "@/components/admin/inquiries-admin-panel";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    include: { plan: true },
    take: 100,
  });

  const rows: InquiryRow[] = inquiries.map((inq) => ({
    id: inq.id,
    name: inq.name,
    email: inq.email,
    phone: inq.phone,
    serviceSlug: inq.serviceSlug,
    type: inq.type,
    status: inq.status,
    planName: inq.plan?.name ?? null,
    createdAt: inq.createdAt,
  }));

  return <InquiriesAdminPanel inquiries={rows} />;
}
