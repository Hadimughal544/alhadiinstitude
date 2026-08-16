"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChangeCountryButton } from "@/components/change-country-button";
import type { RegionContext } from "@/lib/region";
import { cn } from "@/lib/utils";

const links = [
  { href: "/home", label: "Home" },
  { href: "/services/quran", label: "Quran" },
  { href: "/services/tuition", label: "Tuition" },
  { href: "/services/it", label: "IT" },
  { href: "/blog", label: "Blog" },
  { href: "/pricing", label: "Pricing" },
  { href: "/book", label: "Book" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/home") return pathname === "/home";
  if (href === "/blog") return pathname === "/blog" || pathname.startsWith("/blog/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader({
  region,
}: {
  region: RegionContext | null;
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl dark:bg-[#081618]/90 dark:border-gold/15">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <BrandLogo href="/home" size="sm" />
        <nav className="hidden items-center gap-1 text-sm font-medium text-muted xl:gap-1.5 lg:flex">
          {links.map((l) => {
            const active = isActivePath(pathname, l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-3 py-1.5 transition",
                  active
                    ? "bg-teal/15 font-semibold text-teal dark:bg-gold/20 dark:text-gold"
                    : "hover:text-foreground"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          {region && (
            <ChangeCountryButton
              label={`${region.countryName} · ${region.currencyCode}`}
              className="hidden sm:inline-flex"
            />
          )}
          <ThemeToggle />
        </div>
      </div>
      <nav className="flex gap-2 overflow-x-auto border-t border-border px-4 py-2 text-xs font-medium text-muted dark:border-gold/10 lg:hidden">
        {links.map((l) => {
          const active = isActivePath(pathname, l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "whitespace-nowrap rounded-full px-3 py-1.5 transition",
                active
                  ? "bg-teal text-cream dark:bg-gold dark:text-ink"
                  : "bg-foreground/5 hover:bg-foreground/10"
              )}
            >
              {l.label}
            </Link>
          );
        })}
        {region && (
          <ChangeCountryButton
            label="Change country"
            className="whitespace-nowrap rounded-full border-0 bg-foreground/5 px-3 py-1.5"
          />
        )}
      </nav>
    </header>
  );
}
