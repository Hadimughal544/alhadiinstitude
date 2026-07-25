"use client";

import { useTransition } from "react";
import { Globe2 } from "lucide-react";
import { clearCountryAction } from "@/actions";
import { cn } from "@/lib/utils";

export function ChangeCountryButton({
  label,
  className,
  variant = "header",
}: {
  label: string;
  className?: string;
  variant?: "header" | "footer" | "overlay";
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => clearCountryAction())}
      className={cn(
        "inline-flex items-center gap-1.5 transition disabled:opacity-60",
        variant === "header" &&
          "rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground",
        variant === "footer" && "text-cream/80 hover:text-white",
        variant === "overlay" &&
          "rounded-full border border-white/25 bg-black/25 px-3 py-1.5 text-xs font-medium text-white hover:bg-black/40",
        className
      )}
    >
      {(variant === "header" || variant === "overlay") && (
        <Globe2 className="h-3.5 w-3.5" />
      )}
      {pending ? "Switching..." : label}
    </button>
  );
}
