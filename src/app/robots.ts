import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/config";

export default function robots(): MetadataRoute.Robots {
  const base = SITE_URL;
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/teacher",
          "/student",
          "/dashboard",
          "/login",
          "/api",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
