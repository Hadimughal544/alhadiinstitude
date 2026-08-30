import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuickActions({
  actions,
  className,
}: {
  actions: { label: string; href: string; icon: LucideIcon; description?: string }[];
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.href}
            href={action.href}
            className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-teal/30 hover:bg-accent/50 dark:hover:border-gold/30"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">{action.label}</p>
              {action.description && (
                <p className="truncate text-xs text-muted">{action.description}</p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
