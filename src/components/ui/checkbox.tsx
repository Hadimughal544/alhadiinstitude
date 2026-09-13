"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function Checkbox({
  className,
  indeterminate,
  ...props
}: React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & { indeterminate?: boolean }) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border border-border bg-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-teal data-[state=checked]:bg-teal data-[state=checked]:text-cream dark:data-[state=checked]:border-gold dark:data-[state=checked]:bg-gold dark:data-[state=checked]:text-ink",
        className
      )}
      checked={indeterminate ? "indeterminate" : props.checked}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center">
        {indeterminate ? <Minus className="h-3 w-3" /> : <Check className="h-3 w-3" />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
