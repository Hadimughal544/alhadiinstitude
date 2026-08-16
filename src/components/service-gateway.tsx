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
  "from-[#0a3d3d]/90 via-[#061818]/70 to-black/80",
  "from-black/80 via-[#0d4f4f]/55 to-[#061012]/85",
  "from-[#061012]/85 via-[#0a3a3a]/60 to-[#0d4f4f]/75",
];

function shortCurrencyLabel(countryLabel?: string) {
  if (!countryLabel) return "";
  const parts = countryLabel.split("·").map((p) => p.trim());
  return parts[parts.length - 1] || countryLabel;
}

export function ServiceGateway({
  services,
  countryLabel,
}: {
  services: GatewayService[];
  countryLabel?: string;
}) {
  const mobileCountry = shortCurrencyLabel(countryLabel);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#050f10] text-white">
      <div className="pointer-events-none absolute inset-0 z-20 gateway-grain" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 z-[15] bg-[radial-gradient(ellipse_at_top,_rgba(196,163,90,0.12),_transparent_45%),radial-gradient(ellipse_at_bottom,_rgba(13,79,79,0.25),_transparent_50%)]"
        aria-hidden
      />

      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-6 sm:py-5">
        <div className="min-w-0 shrink">
          <span className="sm:hidden">
            <BrandLogo href="/home" size="sm" variant="onDark" showWordmark={false} priority />
          </span>
          <span className="hidden sm:inline-flex">
            <BrandLogo href="/home" size="md" variant="onDark" priority />
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            href="/blog"
            className="inline-flex h-9 items-center rounded-full border border-white/30 bg-black/40 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur transition hover:border-gold/70 hover:bg-gold/20 sm:h-10 sm:px-4 sm:text-sm"
          >
            Blog
          </Link>
          {countryLabel && (
            <>
              <ChangeCountryButton
                label={mobileCountry}
                variant="overlay"
                className="h-9 max-w-[5.5rem] truncate px-2 text-[11px] sm:hidden"
              />
              <ChangeCountryButton
                label={countryLabel}
                variant="overlay"
                className="hidden h-10 sm:inline-flex"
              />
            </>
          )}
          <ThemeToggle className="h-9 w-9 shrink-0 border-white/25 bg-black/40 text-white sm:h-10 sm:w-10" />
        </div>
      </header>

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
              <div className="absolute inset-0 bg-black/30 transition-colors duration-500 group-hover:bg-black/15" />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-gold/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <motion.div
                className="relative z-10 px-5 pt-14 text-center sm:px-6 sm:pt-16"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2 className="font-display text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.55)] sm:text-5xl lg:text-6xl">
                  {service.title}
                </h2>
                <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-relaxed text-white/90 sm:mt-4 sm:text-base">
                  {service.subtitle}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-black/35 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-lg shadow-black/30 backdrop-blur transition group-hover:border-gold group-hover:bg-gold/25 group-hover:text-white">
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
