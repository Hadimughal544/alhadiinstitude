export const COUNTRY_COOKIE = "ahi_country";
export const CURRENCY_COOKIE = "ahi_currency";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export const PUBLIC_PATHS_WITHOUT_COUNTRY = new Set([
  "/",
  "/login",
]);

export function isExemptFromCountryGate(pathname: string) {
  if (PUBLIC_PATHS_WITHOUT_COUNTRY.has(pathname)) return true;
  if (pathname.startsWith("/admin")) return true;
  if (pathname.startsWith("/api")) return true;
  if (pathname.startsWith("/_next")) return true;
  return false;
}
