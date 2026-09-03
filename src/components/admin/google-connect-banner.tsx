"use client";

import Link from "next/link";
import { ArrowUpRight, X } from "lucide-react";
import { useSyncExternalStore } from "react";

const DISMISS_KEY = "ahi_google_banner_dismissed";
const DISMISS_EVENT = "ahi-google-banner-dismissed";

function subscribeDismissed(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(DISMISS_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(DISMISS_EVENT, onStoreChange);
  };
}

function getDismissedSnapshot() {
  return localStorage.getItem(DISMISS_KEY) === "true";
}

export function GoogleConnectBanner() {
  const dismissed = useSyncExternalStore(subscribeDismissed, getDismissedSnapshot, () => false);

  if (dismissed) return null;

  return (
    <div className="relative rounded-xl border border-warning/30 bg-warning-muted p-4 pr-12 text-sm">
      <p>
        <span className="font-medium">Institute Google: action needed.</span> Connect it so classes
        can get open Meet links.
      </p>
      <Link
        href="/admin/settings/google"
        className="mt-2 inline-flex items-center gap-1 font-medium text-teal dark:text-gold"
      >
        Connect Google <ArrowUpRight className="h-4 w-4" />
      </Link>
      <button
        type="button"
        onClick={() => {
          localStorage.setItem(DISMISS_KEY, "true");
          window.dispatchEvent(new Event(DISMISS_EVENT));
        }}
        className="absolute right-3 top-3 rounded-lg p-1 text-muted hover:bg-foreground/5"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
