"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur",
          className
        )}
      />
    );
  }

  const dark = (theme === "system" ? resolvedTheme : theme) === "dark";

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(dark ? "light" : "dark")}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border border-current/15 bg-background/40 text-foreground backdrop-blur transition hover:scale-105",
        className
      )}
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
