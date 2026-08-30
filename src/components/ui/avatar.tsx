import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({
  name,
  className,
  size = "md",
}: {
  name: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "sm" ? "h-8 w-8 text-xs" : size === "lg" ? "h-11 w-11 text-sm" : "h-9 w-9 text-xs";

  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-teal/10 font-semibold text-teal dark:bg-gold/15 dark:text-gold",
        sizeClass,
        className
      )}
      aria-hidden
    >
      {initials(name) || "?"}
    </div>
  );
}
