"use client";

import { Button } from "@/components/ui/button";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-xl border border-border bg-card p-8 text-center">
      <h2 className="font-display text-lg font-semibold">Something went wrong</h2>
      <p className="mt-2 max-w-md text-sm text-muted">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <Button type="button" variant="outline" className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
