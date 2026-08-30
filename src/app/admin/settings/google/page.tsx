import { GoogleConnectCard } from "@/components/dashboard/google-connect-card";
import { disconnectInstituteGoogleFormAction } from "@/actions/admin/google";
import { requireAdmin } from "@/lib/auth-guards";
import { getInstituteGoogleConnection } from "@/lib/meet";
import { GOOGLE_MEET_SPACE_SCOPE } from "@/lib/meet/google-oauth";

export const dynamic = "force-dynamic";

export default async function AdminGoogleSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ google?: string }>;
}) {
  await requireAdmin();
  const [connection, params] = await Promise.all([getInstituteGoogleConnection(), searchParams]);

  const missingMeetScope =
    !!connection && !(connection.scope ?? "").includes(GOOGLE_MEET_SPACE_SCOPE);

  const error =
    params.google === "error"
      ? "Google connection failed. Confirm the Google Meet API is enabled for this project, then try again."
      : params.google === "denied"
        ? "Google access was denied."
        : params.google === "scope" || missingMeetScope
          ? "Reconnect and accept the Google Meet permission so class links can be created."
          : null;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl">Institute Google</h1>
        <p className="mt-1 text-sm text-muted">
          One Google account hosts every class. Meet rooms are created as open meetings, so students
          and guests join straight from the link with no waiting room.
        </p>
      </div>

      <GoogleConnectCard
        connected={!!connection && !missingMeetScope}
        email={connection?.email}
        error={error}
        connectHref="/api/admin/google/connect"
        disconnectAction={disconnectInstituteGoogleFormAction}
      />

      <p className="text-xs text-muted">
        Uses the <code>{GOOGLE_MEET_SPACE_SCOPE}</code> scope only. Disconnecting stops new class
        links from being created; links already generated keep working.
      </p>
    </div>
  );
}
