"use client";

import { useTransition } from "react";
import { selectCountryAction } from "@/actions";
import { cn } from "@/lib/utils";

type Country = {
  code: string;
  name: string;
  flagEmoji: string;
  currencyCode: string;
};

export function CountrySelector({
  countries,
  brandName,
  backgroundUrl,
}: {
  countries: Country[];
  brandName: string;
  backgroundUrl: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-ink/70 via-teal/45 to-ink/80 dark:from-black/80 dark:via-teal/30 dark:to-black/85" />

      <div className="relative z-10 flex min-h-screen flex-col px-4 py-8 sm:px-8 lg:px-14">
        <div className="mb-8 flex items-start justify-between gap-4">
          <p className="font-display text-4xl tracking-tight text-white drop-shadow sm:text-5xl md:text-6xl">
            {brandName}
          </p>
        </div>

        <div className="flex flex-1 items-center justify-center lg:justify-end">
          <div
            className={cn(
              "w-full max-w-md rounded-[1.75rem] px-6 py-7 sm:px-8",
              "bg-[#e8dcc8]/88 text-ink shadow-2xl backdrop-blur-md",
              "dark:bg-[#1a2426]/90 dark:text-cream"
            )}
          >
            <h1 className="text-center text-xl font-semibold tracking-wide sm:text-2xl">
              Select Your Country
            </h1>
            <div className="mx-auto mt-3 mb-5 h-px w-24 bg-ink/25 dark:bg-cream/25" />

            <ul className="max-h-[min(62vh,520px)] space-y-1 overflow-y-auto pr-1">
              {countries.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => startTransition(() => selectCountryAction(c.code))}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-60"
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
