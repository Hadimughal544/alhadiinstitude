"use client";

import { cn } from "@/lib/utils";

export function Tabs({
  value,
  onChange,
  items,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  items: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex gap-1 overflow-x-auto rounded-lg border border-border bg-background p-1",
        className
      )}
    >
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={value === item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            value === item.value
              ? "bg-card text-foreground shadow-sm"
              : "text-muted hover:text-foreground"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
