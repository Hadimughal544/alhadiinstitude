import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 disabled:opacity-50",
        variant === "primary" && "bg-teal text-cream hover:bg-teal-light shadow-lg shadow-teal/20",
        variant === "secondary" && "bg-gold text-ink hover:bg-gold-soft",
        variant === "outline" && "border border-teal/30 bg-transparent text-teal hover:bg-teal/5 dark:text-cream dark:border-cream/20",
        variant === "ghost" && "bg-transparent hover:bg-foreground/5",
        size === "sm" && "h-9 px-4 text-sm",
        size === "md" && "h-11 px-6 text-sm",
        size === "lg" && "h-12 px-8 text-base",
        className
      )}
      {...props}
    />
  );
}
