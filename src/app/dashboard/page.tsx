import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { dashboardPathForRole } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function DashboardRedirectPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  redirect(dashboardPathForRole(session.user.role));
}
