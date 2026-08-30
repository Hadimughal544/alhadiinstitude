import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  href,
  trend,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  href?: string;
  trend?: { value: string; positive?: boolean };
  className?: string;
}) {
  const content = (
    <Card className={cn("transition-colors hover:border-teal/30 dark:hover:border-gold/30", href && "group", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-medium text-muted">{label}</p>
            <p className="font-display text-3xl font-semibold tracking-tight">{value}</p>
            {hint && <p className="text-xs text-muted">{hint}</p>}
            {trend && (
              <p
                className={cn(
                  "text-xs font-medium",
                  trend.positive ? "text-success" : "text-muted"
                )}
              >
                {trend.value}
              </p>
            )}
          </div>
          {Icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
        {href && (
          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-teal opacity-0 transition group-hover:opacity-100 dark:text-gold">
            View details <ArrowUpRight className="h-3 w-3" />
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }
  return content;
}
