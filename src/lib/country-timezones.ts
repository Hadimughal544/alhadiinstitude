export const DEFAULT_TIMEZONE = "Asia/Karachi";

/** Primary IANA timezone per country code on this site. */
export const COUNTRY_TIMEZONES: Record<string, string> = {
  PK: "Asia/Karachi",
  GB: "Europe/London",
  US: "America/New_York",
  CA: "America/Toronto",
  AU: "Australia/Sydney",
  NZ: "Pacific/Auckland",
  BD: "Asia/Dhaka",
  ZA: "Africa/Johannesburg",
  SA: "Asia/Riyadh",
  AE: "Asia/Dubai",
  KW: "Asia/Kuwait",
  QA: "Asia/Qatar",
  OM: "Asia/Muscat",
  BH: "Asia/Bahrain",
  LY: "Africa/Tripoli",
  "218": "Africa/Tripoli",
  ROW: "Europe/London",
};

export function timezoneForCountryCode(code: string | null | undefined) {
  if (!code) return DEFAULT_TIMEZONE;
  return COUNTRY_TIMEZONES[code] || DEFAULT_TIMEZONE;
}

/** True when `tz` is a valid IANA timezone name accepted by Intl. */
export function isValidTimezone(tz: string | null | undefined): boolean {
  if (!tz) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Return `tz` when it is a valid IANA timezone, otherwise `fallback`. */
export function safeTimezone(
  tz: string | null | undefined,
  fallback: string = DEFAULT_TIMEZONE
): string {
  return isValidTimezone(tz) ? (tz as string) : fallback;
}
