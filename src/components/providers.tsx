"use client";

import { ThemeProvider, type ThemeName } from "@/components/theme-provider";
import { Toaster } from "sonner";

export function Providers({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme?: ThemeName;
}) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          classNames: {
            toast: "border border-border bg-card text-foreground shadow-[var(--shadow-card)]",
            title: "font-medium",
            description: "text-muted",
          },
        }}
      />
    </ThemeProvider>
  );
}
