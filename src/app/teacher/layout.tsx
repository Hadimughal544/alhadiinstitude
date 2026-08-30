import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { auth } from "@/lib/auth";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <DashboardShell
      role="TEACHER"
      user={{
        name: session?.user?.name ?? null,
        email: session?.user?.email ?? "",
      }}
    >
      {children}
    </DashboardShell>
  );
}
