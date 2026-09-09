/**
 * Single source of truth for site-level SEO constants.
 * Fill ORG.address / ORG.telephone / ORG.sameAs with real data before launch —
 * they feed the Organization + LocalBusiness JSON-LD.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://alhadiinstitute.org";

export const SITE_NAME = "Al-Hadi Institute";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/opengraph-image.png`;

export const ORG = {
  legalName: "Al-Hadi Institute",
  logo: `${SITE_URL}/brand/al-hadi-logo.png`,
  /** Public social / listing profiles — add real URLs. */
  sameAs: [] as string[],
  /** E.164 phone, e.g. "+92-300-0000000" — leave empty to omit from schema. */
  telephone: "",
  email: "",
  /** postal address for LocalBusiness — leave fields blank to omit. */
  address: {
    streetAddress: "",
    addressLocality: "",
    addressRegion: "",
    postalCode: "",
    addressCountry: "PK",
  },
} as const;

/** Absolute URL helper for canonicals / schema. */
export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
