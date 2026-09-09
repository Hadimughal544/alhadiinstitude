import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Montserrat, Source_Sans_3 } from "next/font/google";
import { Providers } from "@/components/providers";
import { JsonLd, organizationSchema, websiteSchema } from "@/lib/seo/jsonld";
import { SITE_URL, DEFAULT_OG_IMAGE } from "@/lib/seo/config";
import { THEME_COOKIE } from "@/lib/constants";
import { isStoredTheme, themeClassFromCookie, type StoredTheme } from "@/lib/theme-script";
import { cn } from "@/lib/utils";
import "./globals.css";

const display = Montserrat({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl = SITE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Al-Hadi Institute | Quran Tutors, Online Tuition & IT Services",
    template: "%s | Al-Hadi Institute",
  },
  description:
    "Al-Hadi Institute offers Holy Quran tutors, online tuition, and professional IT services — faith-guided education and technology for students worldwide.",
  keywords: [
    "Al-Hadi Institute",
    "Holy Quran tutors",
    "online Quran classes",
    "online tuition",
    "Islamic education",
    "IT services",
    "web development",
    "online learning",
    "Quran teacher",
    "home tutoring online",
  ],
  authors: [{ name: "Al-Hadi Institute" }],
  creator: "Al-Hadi Institute",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: siteUrl,
    siteName: "Al-Hadi Institute",
    title: "Al-Hadi Institute | Quran Tutors, Online Tuition & IT Services",
    description:
      "Faith-guided education and modern IT — Holy Quran tutors, online tuition, and technology services worldwide.",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Al-Hadi Institute",
    description:
      "Holy Quran tutors, online tuition, and IT services guided with excellence.",
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const stored = jar.get(THEME_COOKIE)?.value;
  const initialTheme: StoredTheme = isStoredTheme(stored) ? stored : "system";
  const themeClass = themeClassFromCookie(stored);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(display.variable, body.variable, "h-full", themeClass)}
    >
      <body className="min-h-full flex flex-col antialiased">
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <Providers initialTheme={initialTheme}>{children}</Providers>
      </body>
    </html>
  );
}
