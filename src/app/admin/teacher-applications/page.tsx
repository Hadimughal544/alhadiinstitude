import {
  TeacherApplicationsAdminPanel,
  type TeacherApplicationRow,
} from "@/components/admin/teacher-applications-admin-panel";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminTeacherApplicationsPage() {
  const applications = await prisma.teacherApplication.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const rows: TeacherApplicationRow[] = applications.map((app) => ({
    id: app.id,
    name: app.name,
    email: app.email,
    phone: app.phone,
    serviceSlug: app.serviceSlug,
    subject: app.subject,
    experience: app.experience,
    message: app.message,
    status: app.status,
    createdAt: app.createdAt,
  }));

  return <TeacherApplicationsAdminPanel applications={rows} />;
}
