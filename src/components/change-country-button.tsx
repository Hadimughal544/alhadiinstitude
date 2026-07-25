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
  variant?: "header" | "footer";
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
          "rounded-full border border-foreground/10 px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground",
        variant === "footer" && "hover:text-white",
        className
      )}
    >
      {variant === "header" && <Globe2 className="h-3.5 w-3.5" />}
      {pending ? "Switching..." : label}
    </button>
  );
}
