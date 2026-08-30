import { ChangePasswordForm } from "@/components/dashboard/change-password-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTeacher } from "@/lib/auth-guards";

export const dynamic = "force-dynamic";

export default async function TeacherAccountPage() {
  const session = await requireTeacher();

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
