import { ChangePasswordForm } from "@/components/dashboard/change-password-form";
import { requireStudent } from "@/lib/auth-guards";

export const dynamic = "force-dynamic";

export default async function StudentAccountPage() {
  const session = await requireStudent();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Account</h1>
        <p className="mt-1 text-sm text-muted">{session.user.email}</p>
      </div>
      <ChangePasswordForm />
    </div>
  );
}
