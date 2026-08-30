import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "rounded-full bg-teal text-cream shadow-sm hover:bg-teal-light dark:bg-gold dark:text-ink dark:hover:bg-gold-soft",
        secondary:
          "rounded-full bg-gold text-ink hover:bg-gold-soft",
        outline:
          "rounded-full border border-border bg-transparent text-foreground hover:bg-accent",
        ghost:
          "rounded-lg bg-transparent text-muted hover:bg-foreground/5 hover:text-foreground",
        destructive:
          "rounded-full bg-destructive-muted text-destructive hover:bg-destructive/20",
        link: "rounded-none text-teal underline-offset-4 hover:underline dark:text-gold",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-5 text-sm",
        lg: "h-11 px-6 text-sm",
        icon: "h-9 w-9 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
