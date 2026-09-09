import type { NextConfig } from "next";
import path from "path";

const isProd = process.env.NODE_ENV === "production";

// Content-Security-Policy. The app has no inline application JavaScript (theme is
// applied server-side via a cookie -> class on <html>), so 'unsafe-inline' here only
// covers Next's framework bootstrap and the ld+json data blocks. 'unsafe-eval' is
// dev-only (React Refresh). Inline styles are required by framer-motion / recharts / tiptap.
const contentSecurityPolicy = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' blob: data: https:`,
  `media-src 'self' blob: https:`,
  `font-src 'self' data:`,
  `connect-src 'self' https://res.cloudinary.com`,
  `frame-src 'self' https://meet.google.com https://www.youtube-nocookie.com https://www.youtube.com`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `object-src 'none'`,
  ...(isProd ? [`upgrade-insecure-requests`] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["googleapis"],
  turbopack: {
    // Prevent Next from picking C:\Users\...\Desktop as root when a parent lockfile exists
    root: path.join(__dirname),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      // Service pages moved from /services/<slug> to the top level /<slug>.
      { source: "/services/:slug", destination: "/:slug", permanent: true },
      { source: "/services", destination: "/home", permanent: true },
    ];
  },
};

export default nextConfig;
