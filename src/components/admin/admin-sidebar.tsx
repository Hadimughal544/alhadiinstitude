"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Layers,
  CreditCard,
  Globe2,
  Settings,
  ExternalLink,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
  { href: "/admin/services", label: "Services", icon: Layers },
  { href: "/admin/plans", label: "Plans", icon: CreditCard },
  { href: "/admin/countries", label: "Countries", icon: Globe2 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const NavLinks = (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
      {nav.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-teal text-cream shadow-md shadow-teal/20 dark:bg-gold dark:text-ink"
                : "text-muted hover:bg-foreground/5 hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-foreground/10 bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-foreground/10 bg-card"
        >
          <Menu className="h-5 w-5" />
        </button>
        <p className="font-display text-lg text-teal dark:text-gold">Admin</p>
        <ThemeToggle />
      </div>

      {open && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/45 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-foreground/10 bg-card text-foreground shadow-xl transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-foreground/10 px-4 py-4">
          <BrandLogo href="/admin" size="sm" />
          <button
            type="button"
            className="rounded-lg p-1 text-muted hover:text-foreground lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {NavLinks}

        <div className="mt-auto space-y-2 border-t border-foreground/10 p-4">
          <Link
            href="/home"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted transition hover:bg-foreground/5 hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
            View site
          </Link>
          <div className="flex items-center justify-between gap-2 px-1">
            <button
              type="button"
              onClick={async () => {
                await signOut({ redirect: false });
                window.location.assign("/login");
              }}
              className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted transition hover:bg-foreground/5 hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
