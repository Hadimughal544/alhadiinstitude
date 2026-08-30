import { ChangePasswordForm } from "@/components/dashboard/change-password-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireStudent } from "@/lib/auth-guards";

export const dynamic = "force-dynamic";

export default async function StudentAccountPage() {
  const session = await requireStudent();

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Account" description={session.user.email} />
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
