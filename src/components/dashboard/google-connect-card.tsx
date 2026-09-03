import { Button } from "@/components/ui/button";

export function GoogleConnectCard({
  email,
  connected,
  error,
  connectHref,
  disconnectAction,
  title = "Institute Google account",
  description = "Connect the institute's Google account. Every class Meet link is created here as an open meeting — anyone with the link joins directly, with no waiting to be admitted.",
  connectLabel = "Connect Google",
}: {
  email?: string | null;
  connected: boolean;
  error?: string | null;
  connectHref: string;
  disconnectAction: () => Promise<void>;
  title?: string;
  description?: string;
  connectLabel?: string;
}) {
  return (
    <section className="rounded-2xl border border-foreground/10 bg-card p-5">
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted">{description}</p>
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
              Reconnect
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
          {connectLabel}
        </a>
      )}
    </section>
  );
}
