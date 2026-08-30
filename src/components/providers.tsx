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
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}
