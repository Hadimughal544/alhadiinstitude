import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  Cpu,
  Users,
  Video,
  Award,
  Globe2,
  Clock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { FadeIn, HeroMotion } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getRegionContext, getSettingsMap } from "@/lib/region";

export const dynamic = "force-dynamic";

const icons = {
  quran: BookOpen,
  tuition: GraduationCap,
  it: Cpu,
};

const highlights = [
  { icon: Video, title: "Live online sessions", text: "Zoom & Google Meet classes with personal attention." },
  { icon: Users, title: "Kids, teens & adults", text: "Programs tailored to every age and learning pace." },
  { icon: Award, title: "Certified progress", text: "Structured tracks with certificates and parent updates." },
  { icon: Globe2, title: "Global pricing", text: "Transparent plans in your local currency." },
];

const steps = [
  { step: "01", title: "Choose your country", text: "We show plans and currency for your region." },
  { step: "02", title: "Pick a service", text: "Quran tutors, academic tuition, or IT learn/build." },
  { step: "03", title: "Book a demo", text: "Submit an inquiry — we respond via WhatsApp or email." },
];

const testimonials = [
  {
    quote: "Our daughter’s tajweed improved within weeks. The one-to-one format made all the difference.",
    name: "Amina K.",
    role: "Parent · Quran program",
  },
  {
    quote: "Clear explanations and flexible timing. My son finally feels confident before exams.",
    name: "James R.",
    role: "Parent · Online tuition",
  },
  {
    quote: "They built our landing site and trained our team on the stack. Truly end-to-end.",
    name: "Sara M.",
    role: "Founder · IT services",
  },
];

export default async function HomePage() {
  const [region, settings, services] = await Promise.all([
    getRegionContext(),
    getSettingsMap(),
    prisma.service.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div>
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${settings.homeHeroImage || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=2000&q=80"})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-ink/90 via-teal/75 to-ink/55" />
        <div className="pointer-events-none absolute -left-20 top-24 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 right-10 h-72 w-72 rounded-full bg-teal-light/30 blur-3xl" />

        <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-center px-4 py-20 sm:px-6">
          <HeroMotion>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-white/90 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              Education · Faith · Technology
            </p>
            <p className="mt-6 font-display text-5xl text-white sm:text-6xl md:text-7xl">
              {settings.brandName || "AlHadiInstitude"}
            </p>
            <h1 className="mt-5 max-w-2xl text-2xl font-medium text-white/95 sm:text-3xl">
              {settings.tagline || "Faith, learning, and technology — guided with excellence"}
            </h1>
            <p className="mt-4 max-w-xl text-white/75">
              Holy Quran tutors, online academic tuition, and IT training & delivery — priced for{" "}
              {region?.countryName ?? "your region"} in {region?.currencyCode ?? "local currency"}.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/book">
                <Button variant="secondary" size="lg">
                  Start Now
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="border-white/35 text-white hover:bg-white/10">
                  View Pricing
                </Button>
              </Link>
            </div>
          </HeroMotion>
        </div>
      </section>

      <section className="border-b border-foreground/10 bg-card/50">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {[
            { icon: Clock, label: "Flexible scheduling" },
            { icon: ShieldCheck, label: "Trusted tutors & mentors" },
            { icon: Globe2, label: `${region?.countryName ?? "Global"} pricing` },
            { icon: Award, label: "Demo class available" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <FadeIn key={item.label} delay={i * 0.05}>
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-teal/10 text-teal dark:bg-gold/15 dark:text-gold">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="text-sm font-semibold">{item.label}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <FadeIn>
          <h2 className="font-display text-4xl">Our Services</h2>
          <p className="mt-2 max-w-2xl text-muted">
            Three pillars under one institute — spiritual learning, academic growth, and modern technology.
          </p>
        </FadeIn>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {services.map((s, i) => {
            const Icon = icons[s.slug as keyof typeof icons] ?? BookOpen;
            return (
              <FadeIn key={s.id} delay={i * 0.08}>
                <Link
                  href={`/services/${s.slug}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-foreground/10 bg-card p-7 transition hover:-translate-y-1 hover:border-gold/40 hover:shadow-xl"
                >
                  <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gold/10 transition group-hover:scale-125" />
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal/10 text-teal dark:bg-gold/15 dark:text-gold">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 font-display text-2xl group-hover:text-teal dark:group-hover:text-gold">
                    {s.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-muted">{s.subtitle}</p>
                  <span className="mt-6 text-sm font-semibold text-gold">Explore →</span>
                </Link>
              </FadeIn>
            );
          })}
        </div>
      </section>

      <section className="mesh-bg border-y border-foreground/10 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <FadeIn>
            <h2 className="font-display text-4xl">Why families choose us</h2>
            <p className="mt-2 max-w-2xl text-muted">
              Professional delivery with care — whether you are learning the Quran, boosting grades, or shipping software.
            </p>
          </FadeIn>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((h, i) => {
              const Icon = h.icon;
              return (
                <FadeIn key={h.title} delay={i * 0.06}>
                  <div className="h-full rounded-3xl border border-foreground/10 bg-card/80 p-6 backdrop-blur">
                    <Icon className="h-6 w-6 text-gold" />
                    <h3 className="mt-4 font-semibold">{h.title}</h3>
                    <p className="mt-2 text-sm text-muted">{h.text}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <FadeIn>
          <h2 className="font-display text-4xl">Start in three steps</h2>
        </FadeIn>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <FadeIn key={s.step} delay={i * 0.08}>
              <div className="relative rounded-3xl border border-foreground/10 bg-card p-7">
                <p className="font-display text-4xl text-gold/80">{s.step}</p>
                <h3 className="mt-3 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted">{s.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="border-y border-foreground/10 bg-teal py-20 text-cream dark:bg-[#061012]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <FadeIn>
            <h2 className="font-display text-4xl">What learners say</h2>
            <p className="mt-2 max-w-xl text-cream/70">
              Real outcomes from Quran study, tuition support, and IT engagements.
            </p>
          </FadeIn>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.08}>
                <blockquote className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                  <p className="flex-1 text-sm leading-relaxed text-cream/90">&ldquo;{t.quote}&rdquo;</p>
                  <footer className="mt-6 border-t border-white/10 pt-4">
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-xs text-cream/60">{t.role}</p>
                  </footer>
                </blockquote>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <FadeIn>
          <div className="relative overflow-hidden rounded-[2rem] border border-foreground/10 bg-gradient-to-br from-teal to-[#0a3a3a] px-8 py-14 text-cream shadow-xl dark:from-[#0a2a2e] dark:to-[#061012] sm:px-12">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/25 blur-2xl" />
            <h2 className="relative font-display text-3xl sm:text-4xl">Ready to begin?</h2>
            <p className="relative mt-3 max-w-lg text-cream/80">
              Book a demo class or tell us about your project. We will match you with the right path.
            </p>
            <div className="relative mt-8 flex flex-wrap gap-3">
              <Link href="/book">
                <Button variant="secondary" size="lg">
                  Book a demo
                </Button>
              </Link>
              <Link href="/services/it">
                <Button variant="outline" size="lg" className="border-white/35 text-white hover:bg-white/10">
                  Explore IT services
                </Button>
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
