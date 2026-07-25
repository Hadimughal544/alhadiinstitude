"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChangeCountryButton } from "@/components/change-country-button";
import { cn } from "@/lib/utils";

export type GatewayService = {
  slug: string;
  title: string;
  subtitle: string;
  heroImage: string | null;
};

const FALLBACK_IMAGES: Record<string, string> = {
  quran:
    "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=1600&q=80",
  tuition:
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80",
  it: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1600&q=80",
};

const PANEL_TINTS = [
  "from-[#0d4f4f]/85 via-black/55 to-black/75",
  "from-black/75 via-[#0d4f4f]/50 to-black/80",
  "from-black/80 via-[#0a3a3a]/65 to-[#0d4f4f]/70",
];

export function ServiceGateway({
  services,
  countryLabel,
}: {
  services: GatewayService[];
  countryLabel?: string;
}) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-ink text-white">
      <div className="pointer-events-none absolute inset-0 z-20 gateway-grain" aria-hidden />

      <div className="absolute left-4 top-4 z-30 max-w-[min(70vw,22rem)] sm:left-6 sm:top-6">
        <BrandLogo href="/home" size="md" variant="onDark" priority />
      </div>

      <div className="absolute right-4 top-4 z-30 flex items-center gap-2 sm:right-6 sm:top-6">
        {countryLabel && (
          <ChangeCountryButton
            label={countryLabel}
            variant="overlay"
          />
        )}
        <ThemeToggle className="border-white/25 bg-black/25 text-white" />
      </div>

      <div className="grid min-h-dvh grid-cols-1 md:grid-cols-3">
        {services.map((service, index) => {
          const image =
            service.heroImage ||
            FALLBACK_IMAGES[service.slug] ||
            FALLBACK_IMAGES.quran;
          const tint = PANEL_TINTS[index % PANEL_TINTS.length];

          return (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className={cn(
                "group relative flex min-h-[33.33dvh] items-center justify-center overflow-hidden md:min-h-dvh",
                "border-b border-white/10 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"
              )}
            >
              <div
                className="absolute inset-0 scale-105 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                style={{ backgroundImage: `url(${image})` }}
              />
              <div className={cn("absolute inset-0 bg-gradient-to-b", tint)} />
              <div className="absolute inset-0 bg-black/25 transition-colors duration-500 group-hover:bg-black/10" />

              <motion.div
                className="relative z-10 px-6 text-center"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2 className="font-display text-3xl font-semibold tracking-tight text-white drop-shadow-lg sm:text-4xl lg:text-5xl">
                  {service.title}
                </h2>
                <p className="mx-auto mt-3 max-w-xs text-sm text-white/85 sm:text-base">
                  {service.subtitle}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white opacity-90 backdrop-blur transition group-hover:border-gold/60 group-hover:bg-gold/20 group-hover:opacity-100">
                  Enter
                  <span aria-hidden>→</span>
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
