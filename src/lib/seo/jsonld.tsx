import { SITE_NAME, SITE_URL, ORG } from "@/lib/seo/config";

/**
 * Server-rendered JSON-LD. Emitted inline in the initial HTML (no next/script,
 * no client hydration) so crawlers see it on first fetch.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here; escape "<" to be defensive against
      // string values that could break out of the script element.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export function breadcrumbList(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function organizationSchema() {
  const address =
    ORG.address.streetAddress || ORG.address.addressLocality
      ? { "@type": "PostalAddress", ...ORG.address }
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "EducationalOrganization"],
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    legalName: ORG.legalName,
    url: SITE_URL,
    logo: ORG.logo,
    description:
      "Holy Quran tutors, online tuition, and IT services — faith-guided education and technology for students worldwide.",
    ...(ORG.sameAs.length ? { sameAs: ORG.sameAs } : {}),
    ...(ORG.telephone || ORG.email
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer support",
            ...(ORG.telephone ? { telephone: ORG.telephone } : {}),
            ...(ORG.email ? { email: ORG.email } : {}),
          },
        }
      : {}),
    ...(address ? { address } : {}),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}
