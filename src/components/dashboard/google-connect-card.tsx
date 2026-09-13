import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
    <Card>
      <CardContent className="p-5">
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        {connected ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm">
              Connected as <span className="font-medium">{email}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              <a href={connectHref} className={cn(buttonVariants({ size: "sm" }))}>
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
          <a href={connectHref} className={cn(buttonVariants({ size: "lg" }), "mt-4")}>
            {connectLabel}
          </a>
        )}
      </CardContent>
    </Card>
  );
}
