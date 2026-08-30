import { ChangePasswordForm } from "@/components/dashboard/change-password-form";
import { GoogleConnectCard } from "@/components/dashboard/google-connect-card";
import { disconnectTeacherGoogleFormAction } from "@/actions/teacher/google";
import { requireTeacher } from "@/lib/auth-guards";
import { getGoogleConnectionForUser } from "@/lib/meet";

export const dynamic = "force-dynamic";

export default async function TeacherAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ google?: string }>;
}) {
  const session = await requireTeacher();
  const [connection, params] = await Promise.all([
    getGoogleConnectionForUser(session.user.id),
    searchParams,
  ]);

  const googleError =
    params.google === "error"
      ? "Google connection failed. Confirm the Calendar API is enabled, accept Calendar access, and try again."
      : params.google === "denied"
        ? "Google access was denied."
        : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Account</h1>
        <p className="mt-1 text-sm text-muted">{session.user.email}</p>
      </div>
      <GoogleConnectCard
        connected={!!connection}
        email={connection?.email}
        error={googleError}
        connectHref="/api/teacher/google/connect"
        disconnectAction={disconnectTeacherGoogleFormAction}
      />
      <div>
        <h2 className="font-semibold">Password</h2>
        <div className="mt-4">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
