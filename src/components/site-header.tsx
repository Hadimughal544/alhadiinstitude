import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChangeCountryButton } from "@/components/change-country-button";
import type { RegionContext } from "@/lib/region";

const links = [
  { href: "/home", label: "Home" },
  { href: "/services/quran", label: "Quran" },
  { href: "/services/tuition", label: "Tuition" },
  { href: "/services/it", label: "IT" },
  { href: "/pricing", label: "Pricing" },
  { href: "/book", label: "Book" },
];

export function SiteHeader({
  region,
}: {
  region: RegionContext | null;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <BrandLogo href="/home" size="sm" />
        <nav className="hidden items-center gap-5 text-sm font-medium text-muted lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-foreground">
              {l.label}
            </Link>
          ))}
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
      <nav className="flex gap-2 overflow-x-auto border-t border-border px-4 py-2 text-xs font-medium text-muted lg:hidden">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="whitespace-nowrap rounded-full bg-foreground/5 px-3 py-1.5">
            {l.label}
          </Link>
        ))}
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
