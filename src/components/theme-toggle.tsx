"use client";

import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const dark = (theme === "system" ? resolvedTheme : theme) === "dark";

  return (
    <button
      type="button"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(dark ? "light" : "dark")}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border border-current/15 bg-background/40 text-foreground backdrop-blur transition hover:scale-105",
        className
      )}
      suppressHydrationWarning
    >
      <span suppressHydrationWarning>{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</span>
    </button>
  );
}
