import { THEME_COOKIE } from "@/lib/constants";

export const THEME_STORAGE_KEY = "theme";

export type StoredTheme = "light" | "dark" | "system";

export function isStoredTheme(value: string | undefined | null): value is StoredTheme {
  return value === "light" || value === "dark" || value === "system";
}

export function themeClassFromCookie(value: string | undefined) {
  if (value === "dark" || value === "light") return value;
  return "";
}

export function persistThemeCookie(theme: StoredTheme) {
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}
