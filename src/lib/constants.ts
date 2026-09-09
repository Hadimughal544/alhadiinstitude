export const COUNTRY_COOKIE = "ahi_country";
export const CURRENCY_COOKIE = "ahi_currency";
export const THEME_COOKIE = "ahi_theme";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export const PUBLIC_PATHS_WITHOUT_COUNTRY = new Set([
  "/",
  "/login",
  "/dashboard",
]);

/**
 * Public marketing routes. These must stay crawlable and reachable without a
 * country cookie — they render with a default region and expose an on-page
 * country picker instead of redirecting.
 */
const MARKETING_EXACT = new Set(["/home", "/pricing", "/book", "/blog"]);
const RESERVED_TOP_LEVEL = new Set([
  "",
  "home",
  "pricing",
  "book",
  "blog",
  "login",
  "dashboard",
  "admin",
  "teacher",
  "student",
  "api",
  "sitemap.xml",
  "robots.txt",
]);

export function isMarketingPath(pathname: string) {
  if (MARKETING_EXACT.has(pathname)) return true;
  if (pathname.startsWith("/blog/")) return true;
  if (pathname.startsWith("/services/")) return true;
  // Top-level service slugs, e.g. /online-quran-learning
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 1 && !RESERVED_TOP_LEVEL.has(segments[0])) return true;
  return false;
}

export function isExemptFromCountryGate(pathname: string) {
  if (PUBLIC_PATHS_WITHOUT_COUNTRY.has(pathname)) return true;
  if (isMarketingPath(pathname)) return true;
  if (pathname.startsWith("/admin")) return true;
  if (pathname.startsWith("/teacher")) return true;
  if (pathname.startsWith("/student")) return true;
  if (pathname.startsWith("/dashboard")) return true;
  if (pathname.startsWith("/api")) return true;
  if (pathname.startsWith("/_next")) return true;
  // Static assets served from /public (images, fonts, icons, etc.)
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) return true;
  return false;
}
