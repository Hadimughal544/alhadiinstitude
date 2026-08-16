import Link from "next/link";
import { PlanCards } from "@/components/plan-cards";
import { FadeIn, HeroMotion } from "@/components/motion";
import { Button } from "@/components/ui/button";
import type { RegionContext } from "@/lib/region";

type Feature = { title: string; description: string };
type Faq = { q: string; a: string };

type ServiceView = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  heroImage?: string | null;
  features: unknown;
  faqs: unknown;
};

type PlanView = {
  id: string;
  name: string;
  badge?: string | null;
  classesOrHours?: string | null;
  durationMins?: number | null;
  features: unknown;
  featured: boolean;
  prices: Array<{ amount: { toString(): string }; currencyCode: string }>;
};

export function ServicePageContent({
  service,
  plans,
  region,
}: {
  service: ServiceView;
  plans: PlanView[];
  region: RegionContext;
}) {
  const features = (Array.isArray(service.features) ? service.features : []) as Feature[];
  const faqs = (Array.isArray(service.faqs) ? service.faqs : []) as Faq[];

  const planCards = plans.map((p) => {
    const price = p.prices.find((x) => x.currencyCode === region.currencyCode) ?? p.prices[0];
    return {
      ...p,
      price: price
        ? { amount: price.amount.toString(), currencyCode: price.currencyCode }
        : null,
      currencySymbol: region.currencySymbol,
    };
  });

  return (
    <div>
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${service.heroImage || "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1600&q=80"})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-teal/70 to-ink/50" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <HeroMotion>
            <p className="font-display text-4xl font-extrabold tracking-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl">
              Al-Hadi Institute
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-[clamp(1.85rem,4.5vw,3rem)] font-extrabold tracking-tight text-white">
              {service.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base text-white/85 sm:text-lg">
              {service.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/book?service=${service.slug}`}>
                <Button variant="secondary" size="lg">
                  Book a Demo
                </Button>
              </Link>
              <a href="#pricing">
                <Button variant="outline" size="lg" className="border-white/40 text-white hover:bg-white/10">
                  View Plans
                </Button>
              </a>
            </div>
          </HeroMotion>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <FadeIn>
          <h2 className="font-display text-[clamp(1.75rem,3vw,2.25rem)] font-extrabold tracking-tight">What we offer</h2>
          <p className="mt-2 max-w-2xl text-muted">{service.description}</p>
        </FadeIn>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.05}>
              <div className="h-full rounded-3xl border border-foreground/10 bg-card p-6 dark:border-gold/15 dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
                <h3 className="text-lg font-semibold text-teal dark:text-gold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted">{f.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section id="pricing" className="mesh-bg border-y border-foreground/10 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <FadeIn>
            <h2 className="font-display text-[clamp(1.75rem,3vw,2.25rem)] font-extrabold tracking-tight">Simple Pricing Plans</h2>
            <p className="mt-2 text-muted">
              Prices shown in {region.currencyCode} ({region.countryName}).
            </p>
          </FadeIn>
          <div className="mt-10">
            <PlanCards plans={planCards} serviceSlug={service.slug} />
          </div>
        </div>
      </section>

      {service.slug === "it" && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <FadeIn>
            <h2 className="font-display text-[clamp(1.75rem,3vw,2.25rem)] font-extrabold tracking-tight">Learn or hire us</h2>
            <p className="mt-2 max-w-2xl text-muted">
              Upskill with structured courses, or engage our team to design and ship web apps, mobile products, branding, marketing, and AI automations.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <Link href={`/book?service=it&type=COURSE`} className="rounded-3xl border border-foreground/10 bg-card p-8 transition hover:border-gold/40">
                <h3 className="text-xl font-semibold">I want to learn</h3>
                <p className="mt-2 text-sm text-muted">Course tracks in web, app, design, marketing, and AI.</p>
              </Link>
              <Link href={`/book?service=it&type=PROJECT`} className="rounded-3xl border border-foreground/10 bg-card p-8 transition hover:border-gold/40">
                <h3 className="text-xl font-semibold">I want you to build</h3>
                <p className="mt-2 text-sm text-muted">Client projects delivered end-to-end by our team.</p>
              </Link>
            </div>
          </FadeIn>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <FadeIn>
          <h2 className="font-display text-[clamp(1.75rem,3vw,2.25rem)] font-extrabold tracking-tight">FAQs</h2>
        </FadeIn>
        <div className="mt-8 space-y-4">
          {faqs.map((faq) => (
            <details key={faq.q} className="rounded-2xl border border-foreground/10 bg-card px-5 py-4">
              <summary className="cursor-pointer font-medium">{faq.q}</summary>
              <p className="mt-2 text-sm text-muted">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
