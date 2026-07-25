"use client";

import { useTransition } from "react";
import { selectCountryAction } from "@/actions";
import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";

type Country = {
  code: string;
  name: string;
  flagEmoji: string;
  currencyCode: string;
};

export function CountrySelector({
  countries,
  backgroundUrl,
}: {
  countries: Country[];
  backgroundUrl: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-teal/40 to-black/80 dark:from-black/85 dark:via-teal/25 dark:to-black/90" />

      <div className="relative z-10 flex min-h-dvh flex-col px-4 py-8 sm:px-8 lg:px-14">
        <div className="mb-8 flex items-start justify-between gap-4">
          <BrandLogo
            href={null}
            size="lg"
            variant="onDark"
            layout="horizontal"
            priority
          />
        </div>

        <div className="flex flex-1 items-center justify-center lg:justify-end">
          <div
            className={cn(
              "w-full max-w-md rounded-[1.75rem] px-6 py-7 sm:px-8",
              "border border-border bg-panel text-foreground shadow-2xl backdrop-blur-md"
            )}
          >
            <h1 className="text-center text-xl font-semibold tracking-wide sm:text-2xl">
              Select Your Country
            </h1>
            <div className="mx-auto mt-3 mb-5 h-px w-24 bg-foreground/20" />

            <ul className="max-h-[min(62vh,520px)] space-y-1 overflow-y-auto overscroll-contain pr-1">
              {countries.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => startTransition(() => selectCountryAction(c.code))}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-foreground/5 disabled:opacity-60"
                  >
                    <span className="text-2xl leading-none" aria-hidden>
                      {c.flagEmoji}
                    </span>
                    <span className="text-base font-medium sm:text-lg">{c.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-white/75 lg:text-left">
          Choose your region to see pricing in your local currency.
        </p>
      </div>
    </div>
  );
}
