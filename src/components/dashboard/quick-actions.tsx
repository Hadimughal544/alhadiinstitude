import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuickActions({
  actions,
  className,
  size = "default",
}: {
  actions: { label: string; href: string; icon: LucideIcon; description?: string }[];
  className?: string;
  /** "lg" gives full-width, roomier cards — for narrow sidebars with few actions. */
  size?: "default" | "lg";
}) {
  const large = size === "lg";

  return (
    <div
      className={cn(
        "grid",
        large ? "gap-3 sm:grid-cols-2 lg:grid-cols-1" : "gap-2 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.href}
            href={action.href}
            className={cn(
              "group flex items-center gap-3 rounded-xl border border-border bg-card transition hover:border-teal/30 hover:bg-accent/50 hover:shadow-[var(--shadow-card)] dark:hover:border-gold/30",
              large ? "gap-4 p-5" : "p-4"
            )}
          >
            <div
              className={cn(
                "flex shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-transform group-hover:scale-105",
                large ? "h-12 w-12 rounded-xl" : "h-9 w-9"
              )}
            >
              <Icon className={large ? "h-5 w-5" : "h-4 w-4"} />
            </div>
            <div className="min-w-0 flex-1">
              <p className={cn("font-medium", large ? "text-base" : "text-sm")}>{action.label}</p>
              {action.description && (
                <p className={cn("truncate text-muted", large ? "mt-0.5 text-sm" : "text-xs")}>
                  {action.description}
                </p>
              )}
            </div>
            {large && (
              <ChevronRight className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-teal dark:group-hover:text-gold" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
