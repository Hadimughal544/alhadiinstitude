import type { Metadata } from "next";
import { Montserrat, Source_Sans_3 } from "next/font/google";
import { Providers } from "@/components/providers";
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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://alhadiinstitute.com";

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
  },
  twitter: {
    card: "summary_large_image",
    title: "Al-Hadi Institute",
    description:
      "Holy Quran tutors, online tuition, and IT services guided with excellence.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "Al-Hadi Institute",
    url: siteUrl,
    description:
      "Holy Quran tutors, online tuition, and IT services — education and technology guided with excellence.",
  };

  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
