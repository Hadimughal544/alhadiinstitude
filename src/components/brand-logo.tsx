import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  href?: string | null;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "onDark";
  layout?: "horizontal" | "stacked";
  showWordmark?: boolean;
  className?: string;
  priority?: boolean;
};

const SIZE = {
  sm: { image: 40, title: "text-base sm:text-lg", sub: "text-[10px] sm:text-xs" },
  md: { image: 56, title: "text-xl sm:text-2xl", sub: "text-xs sm:text-sm" },
  lg: { image: 80, title: "text-2xl sm:text-4xl", sub: "text-sm sm:text-base" },
};

export function BrandLogo({
  href = "/home",
  size = "sm",
  variant = "default",
  layout = "horizontal",
  showWordmark = true,
  className,
  priority = false,
}: BrandLogoProps) {
  const s = SIZE[size];
  const onDark = variant === "onDark";

  const content = (
    <span
      className={cn(
        "inline-flex items-center gap-2.5",
        layout === "stacked" && "flex-col gap-2 text-center",
        className
      )}
    >
      <span
        className={cn(
          "relative shrink-0 overflow-hidden rounded-md bg-white",
          onDark && "ring-1 ring-white/20"
        )}
        style={{ width: s.image, height: s.image }}
      >
        <Image
          src="/brand/al-hadi-logo.png"
          alt="Al-Hadi Institute"
          fill
          sizes={`${s.image}px`}
          priority={priority}
          className={cn(
            "object-contain p-0.5",
            onDark ? "brightness-110 contrast-110" : "dark:brightness-110"
          )}
        />
      </span>
      {showWordmark && (
        <span
          className={cn(
            "leading-none",
            onDark ? "text-white" : "text-[#2a2a2a] dark:text-cream"
          )}
        >
          <span className={cn("block font-display font-extrabold tracking-tight", s.title)}>
            Al-Hadi
          </span>
          <span
            className={cn(
              "mt-0.5 block font-medium italic tracking-wide opacity-90",
              s.sub,
              layout === "horizontal" && "pl-0.5"
            )}
          >
            Institute
          </span>
        </span>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="inline-flex shrink-0 transition hover:opacity-90">
      {content}
    </Link>
  );
}
