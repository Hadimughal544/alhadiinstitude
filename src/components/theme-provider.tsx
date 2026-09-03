"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  isStoredTheme,
  persistThemeCookie,
  THEME_STORAGE_KEY,
  type StoredTheme,
} from "@/lib/theme-script";

export type ThemeName = StoredTheme;
export type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  resolvedTheme: ResolvedTheme;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(): ThemeName {
  if (typeof window === "undefined") return "system";
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (isStoredTheme(stored)) return stored;
  } catch {
    // Ignore private-mode / blocked storage.
  }
  return "system";
}

function applyThemeClass(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
}

function resolveTheme(theme: ThemeName, systemDark: boolean): ResolvedTheme {
  if (theme === "system") return systemDark ? "dark" : "light";
  return theme;
}

export function ThemeProvider({
  children,
  initialTheme = "system",
}: {
  children: React.ReactNode;
  initialTheme?: ThemeName;
}) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    if (typeof window === "undefined") return initialTheme;
    return readStoredTheme();
  });
  const [systemDark, setSystemDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const resolvedTheme = resolveTheme(theme, systemDark);

  useLayoutEffect(() => {
    applyThemeClass(resolvedTheme);
    persistThemeCookie(theme);
  }, [theme, resolvedTheme]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemDark(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const setTheme = useCallback((next: ThemeName) => {
    setThemeState(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Ignore private-mode / blocked storage.
    }
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, resolvedTheme }),
    [theme, setTheme, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
