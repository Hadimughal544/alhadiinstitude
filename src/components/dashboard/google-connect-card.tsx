import { Button } from "@/components/ui/button";

export function GoogleConnectCard({
  email,
  connected,
  error,
  connectHref,
  disconnectAction,
}: {
  email?: string | null;
  connected: boolean;
  error?: string | null;
  connectHref: string;
  disconnectAction: () => Promise<void>;
}) {
  return (
    <section className="rounded-2xl border border-foreground/10 bg-card p-5">
      <h2 className="font-semibold">Google Calendar</h2>
      <p className="mt-1 text-sm text-muted">
        Connect your Google account so you are the host of each class. Students only see the join
        link at class time; you see it 5 minutes earlier.
      </p>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {connected ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm">
            Connected as <span className="font-medium">{email}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href={connectHref}
              className="inline-flex h-9 items-center rounded-full bg-teal px-4 text-sm font-medium text-cream dark:bg-gold dark:text-ink"
            >
              Reconnect Google
            </a>
            <form action={disconnectAction}>
              <Button type="submit" variant="outline" size="sm">
                Disconnect
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <a
          href={connectHref}
          className="mt-4 inline-flex h-11 items-center rounded-full bg-teal px-6 text-sm font-medium text-cream dark:bg-gold dark:text-ink"
        >
          Connect Google Calendar
        </a>
      )}
    </section>
  );
}
