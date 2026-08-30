"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, ExternalLink, LogOut, Menu } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { signOut } from "next-auth/react";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetHeader } from "@/components/ui/sheet";
import { DASHBOARD_CONFIG, getPageTitle } from "@/lib/dashboard-nav";
import type { PortalRole } from "@/lib/roles";
import { cn } from "@/lib/utils";

const SIDEBAR_COLLAPSED_KEY = "ahi_sidebar_collapsed";
const SIDEBAR_COLLAPSED_EVENT = "ahi-sidebar-collapsed";

function subscribeSidebarCollapsed(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(SIDEBAR_COLLAPSED_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(SIDEBAR_COLLAPSED_EVENT, onStoreChange);
  };
}

function getSidebarCollapsedSnapshot() {
  return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
}

function formatDate() {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function NavContent({
  role,
  pathname,
  collapsed,
  onNavigate,
}: {
  role: PortalRole;
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const config = DASHBOARD_CONFIG[role];

  return (
    <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-4">
      {config.groups.map((group) => (
        <div key={group.label}>
          {!collapsed && (
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
              {group.label}
            </p>
          )}
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted hover:bg-foreground/5 hover:text-foreground",
                    collapsed && "justify-center px-2"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-teal dark:bg-gold" />
                  )}
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function SidebarFooter({
  collapsed,
  displayName,
  email,
  viewSiteHref,
  showCollapse,
  onToggleCollapse,
}: {
  collapsed: boolean;
  displayName: string;
  email: string;
  viewSiteHref?: string;
  showCollapse?: boolean;
  onToggleCollapse: () => void;
}) {
  return (
    <div className="mt-auto space-y-2 border-t border-border p-3">
      {!collapsed && (
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar name={displayName} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{displayName}</p>
            <p className="truncate text-xs text-muted">{email}</p>
          </div>
        </div>
      )}
      {viewSiteHref && !collapsed && (
        <Link
          href={viewSiteHref}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-foreground/5 hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4" />
          View site
        </Link>
      )}
      <div className={cn("flex items-center gap-1", collapsed ? "flex-col" : "justify-between")}>
        <button
          type="button"
          onClick={async () => {
            await signOut({ redirect: false });
            window.location.assign("/login");
          }}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-foreground/5 hover:text-foreground",
            collapsed && "px-2"
          )}
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && "Logout"}
        </button>
        <ThemeToggle />
      </div>
      {showCollapse && (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden w-full items-center justify-center gap-2 rounded-lg border border-border py-2 text-xs text-muted transition hover:bg-foreground/5 lg:flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && "Collapse"}
        </button>
      )}
    </div>
  );
}

export function DashboardShell({
  role,
  user,
  children,
}: {
  role: PortalRole;
  user: { name: string | null; email: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const collapsed = useSyncExternalStore(
    subscribeSidebarCollapsed,
    getSidebarCollapsedSnapshot,
    () => false
  );
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const config = DASHBOARD_CONFIG[role];
  const pageTitle = getPageTitle(pathname, role);
  const displayName = user.name || user.email.split("@")[0];

  const toggleCollapsed = () => {
    const next = !getSidebarCollapsedSnapshot();
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
    window.dispatchEvent(new Event(SIDEBAR_COLLAPSED_EVENT));
  };

  const sidebarWidth = collapsed ? "lg:w-[72px]" : "lg:w-[280px]";
  const mainOffset = collapsed ? "lg:pl-[72px]" : "lg:pl-[280px]";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-sidebar transition-[width] duration-200 lg:flex",
          sidebarWidth
        )}
      >
        <div className={cn("flex items-center border-b border-border px-4 py-4", collapsed && "justify-center px-2")}>
          <BrandLogo href={config.homeHref} size="sm" showWordmark={!collapsed} />
        </div>
        {!collapsed && (
          <div className="px-4 py-3">
            <Badge variant="teal">{config.title} portal</Badge>
          </div>
        )}
        <NavContent role={role} pathname={pathname} collapsed={collapsed} />
        <SidebarFooter
          collapsed={collapsed}
          displayName={displayName}
          email={user.email}
          viewSiteHref={config.viewSiteHref}
          showCollapse
          onToggleCollapse={toggleCollapsed}
        />
      </aside>

      {/* Mobile sheet */}
      <Sheet open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <SheetHeader onClose={() => setMobileOpen(false)}>
          <BrandLogo href={config.homeHref} size="sm" />
        </SheetHeader>
        <div className="px-3 py-2">
          <Badge variant="teal">{config.title} portal</Badge>
        </div>
        <NavContent role={role} pathname={pathname} collapsed={false} onNavigate={() => setMobileOpen(false)} />
        <SidebarFooter
          collapsed={false}
          displayName={displayName}
          email={user.email}
          viewSiteHref={config.viewSiteHref}
          onToggleCollapse={toggleCollapsed}
        />
      </Sheet>

      <div className={cn("flex min-h-screen min-w-0 flex-col", mainOffset)}>
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <p className="truncate font-display text-base font-semibold sm:text-lg">{pageTitle}</p>
              <p className="hidden text-xs text-muted sm:block">{formatDate()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5 transition hover:bg-accent/50"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <Avatar name={displayName} size="sm" />
                <span className="hidden max-w-[120px] truncate text-sm font-medium sm:block">
                  {displayName}
                </span>
              </button>
              {userMenuOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40"
                    aria-label="Close menu"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-50 mt-2 w-52 rounded-xl border border-border bg-card p-1 shadow-[var(--shadow-card)]">
                    <div className="border-b border-border px-3 py-2">
                      <p className="truncate text-sm font-medium">{displayName}</p>
                      <p className="truncate text-xs text-muted">{user.email}</p>
                      <Badge variant="outline" className="mt-1.5">
                        {config.title}
                      </Badge>
                    </div>
                    {config.accountHref && (
                      <Link
                        href={config.accountHref}
                        onClick={() => setUserMenuOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm hover:bg-foreground/5"
                      >
                        Account settings
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={async () => {
                        setUserMenuOpen(false);
                        await signOut({ redirect: false });
                        window.location.assign("/login");
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:bg-foreground/5 hover:text-foreground"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
