import type { MetadataRoute } from "next";

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://alhadiinstitute.com").replace(
    /\/$/,
    ""
  );
}

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/teacher", "/student", "/dashboard", "/login"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
