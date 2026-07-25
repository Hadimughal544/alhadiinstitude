import Link from "next/link";
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
  brandName,
  region,
}: {
  brandName: string;
  region: RegionContext | null;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-foreground/10 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/home" className="font-display text-xl tracking-tight text-teal dark:text-gold sm:text-2xl">
          {brandName}
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium text-muted md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {region && (
            <ChangeCountryButton
              label={`${region.countryName} · ${region.currencyCode}`}
              className="hidden sm:inline-flex"
            />
          )}
          <ThemeToggle />
        </div>
      </div>
      <nav className="flex gap-3 overflow-x-auto border-t border-foreground/5 px-4 py-2 text-xs font-medium text-muted md:hidden">
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
