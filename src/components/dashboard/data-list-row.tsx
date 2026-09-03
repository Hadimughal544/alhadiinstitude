import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function DataListRow({
  name,
  subtitle,
  meta,
  badge,
  badgeVariant = "outline",
  action,
  onClick,
  className,
}: {
  name: string;
  subtitle?: string;
  meta?: string;
  badge?: string;
  badgeVariant?: "default" | "success" | "warning" | "destructive" | "info" | "outline" | "teal";
  action?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition",
        onClick && "hover:border-teal/30 hover:bg-accent/30 dark:hover:border-gold/30",
        className
      )}
    >
      <Avatar name={name} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{name}</p>
        {subtitle && <p className="truncate text-sm text-muted">{subtitle}</p>}
        {meta && <p className="mt-0.5 truncate text-xs text-muted">{meta}</p>}
      </div>
      {badge && <Badge variant={badgeVariant}>{badge}</Badge>}
      {action}
    </Wrapper>
  );
}
