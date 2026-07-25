import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("sslmode=require")
    ? { rejectUnauthorized: false }
    : undefined,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const CURRENCIES = [
  "PKR",
  "USD",
  "GBP",
  "CAD",
  "AUD",
  "NZD",
  "BDT",
  "SAR",
  "ZAR",
  "AED",
  "KWD",
  "QAR",
  "OMR",
  "BHD",
] as const;

/** Approximate multipliers from a GBP base amount */
const FX: Record<(typeof CURRENCIES)[number], number> = {
  GBP: 1,
  USD: 1.27,
  CAD: 1.72,
  AUD: 1.92,
  NZD: 2.08,
  PKR: 355,
  BDT: 155,
  SAR: 4.76,
  ZAR: 23.5,
  AED: 4.7,
  KWD: 0.39,
  QAR: 4.65,
  OMR: 0.49,
  BHD: 0.48,
};

function pricesFromGbp(gbp: number) {
  return CURRENCIES.map((currencyCode) => ({
    currencyCode,
    amount: Math.round(gbp * FX[currencyCode] * 100) / 100,
  }));
}

const countries = [
  { code: "SA", name: "Saudi Arabia", currencyCode: "SAR", currencySymbol: "﷼", flagEmoji: "🇸🇦", sortOrder: 1 },
  { code: "AE", name: "United Arab Emirates", currencyCode: "AED", currencySymbol: "د.إ", flagEmoji: "🇦🇪", sortOrder: 2 },
  { code: "KW", name: "Kuwait", currencyCode: "KWD", currencySymbol: "د.ك", flagEmoji: "🇰🇼", sortOrder: 3 },
  { code: "QA", name: "Qatar", currencyCode: "QAR", currencySymbol: "ر.ق", flagEmoji: "🇶🇦", sortOrder: 4 },
  { code: "OM", name: "Oman", currencyCode: "OMR", currencySymbol: "ر.ع.", flagEmoji: "🇴🇲", sortOrder: 5 },
  { code: "BH", name: "Bahrain", currencyCode: "BHD", currencySymbol: "د.ب", flagEmoji: "🇧🇭", sortOrder: 6 },
  { code: "GB", name: "United Kingdom", currencyCode: "GBP", currencySymbol: "£", flagEmoji: "🇬🇧", sortOrder: 7 },
  { code: "US", name: "United States", currencyCode: "USD", currencySymbol: "$", flagEmoji: "🇺🇸", sortOrder: 8 },
  { code: "CA", name: "Canada", currencyCode: "CAD", currencySymbol: "C$", flagEmoji: "🇨🇦", sortOrder: 9 },
  { code: "AU", name: "Australia", currencyCode: "AUD", currencySymbol: "A$", flagEmoji: "🇦🇺", sortOrder: 10 },
  { code: "NZ", name: "New Zealand", currencyCode: "NZD", currencySymbol: "NZ$", flagEmoji: "🇳🇿", sortOrder: 11 },
  { code: "PK", name: "Pakistan", currencyCode: "PKR", currencySymbol: "Rs", flagEmoji: "🇵🇰", sortOrder: 12 },
  { code: "BD", name: "Bangladesh", currencyCode: "BDT", currencySymbol: "৳", flagEmoji: "🇧🇩", sortOrder: 13 },
  { code: "ZA", name: "South Africa", currencyCode: "ZAR", currencySymbol: "R", flagEmoji: "🇿🇦", sortOrder: 14 },
  { code: "ROW", name: "Rest Of The World", currencyCode: "USD", currencySymbol: "$", flagEmoji: "🌍", sortOrder: 15 },
];

async function main() {
  console.log("Seeding Al-Hadi Institute...");

  for (const c of countries) {
    await prisma.country.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
  }

  const quran = await prisma.service.upsert({
    where: { slug: "quran" },
    update: {},
    create: {
      slug: "quran",
      title: "Holy Quran Tutors",
      subtitle: "Learn and recite the Holy Quran with proper tajweed and understanding",
      description:
        "Professional online tutoring for both adults and kids via Zoom & Google Meet. Structured programs for Nazra, Tajweed, and Hifz with individual attention and Tarbiyah.",
      heroImage:
        "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=1600&q=80",
      sortOrder: 1,
      features: [
        { title: "Quran with Tajweed", description: "Correct pronunciation and articulation points of Quranic Arabic." },
        { title: "Nazra", description: "Fluency in reading the Holy Quran directly from the text." },
        { title: "Hifz", description: "Structured memorization with regular revision for long-term retention." },
        { title: "One to One Classes", description: "Interactive Zoom & Google Meet sessions with Tarbiyah focus." },
        { title: "Parent Consultation", description: "Weekly meetings to discuss progress and improvement plans." },
        { title: "Certificates", description: "Recognized certificate upon successful course completion." },
      ],
      faqs: [
        { q: "Who can join?", a: "Kids (4–12), teens (13–17), and adults (18+) are welcome." },
        { q: "How are classes delivered?", a: "Live one-to-one sessions on Zoom or Google Meet." },
        { q: "Can I book a demo?", a: "Yes — book a free 30-minute demo class before enrolling." },
      ],
    },
  });

  const tuition = await prisma.service.upsert({
    where: { slug: "tuition" },
    update: {},
    create: {
      slug: "tuition",
      title: "Online Tuition",
      subtitle: "Expert tutors that release academic potential",
      description:
        "One-to-one online tutoring tailored to your child's goals — from core subjects to exam preparation. Share your goals, get matched with the right tutor, and start learning with confidence.",
      heroImage:
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80",
      sortOrder: 2,
      features: [
        { title: "Share your goals", description: "Tell us the subject, level, and when you need help." },
        { title: "Find the perfect fit", description: "We match you with tutors who click with your learner." },
        { title: "Let the learning begin", description: "Book lessons and build grades and confidence." },
        { title: "Maths & Sciences", description: "Maths, Chemistry, Biology, Physics, and more." },
        { title: "Languages & Humanities", description: "English, Economics, History, and exam technique." },
        { title: "Personalised lessons", description: "Sessions adapted to learning style and curriculum." },
      ],
      faqs: [
        { q: "Which subjects do you cover?", a: "Maths, English, Sciences, Economics, and more — primary through A-Level / equivalent." },
        { q: "Are lessons one-to-one?", a: "Yes. Every session is personalised and delivered online." },
        { q: "How do I get started?", a: "Submit an inquiry or book a demo — we'll match you with a suitable tutor." },
      ],
    },
  });

  const it = await prisma.service.upsert({
    where: { slug: "it" },
    update: {},
    create: {
      slug: "it",
      title: "IT Services & Training",
      subtitle: "Learn modern tech skills — or hire us to build for you",
      description:
        "We teach and deliver web development, app development, graphic design, digital marketing, and AI automations. Choose a course track to upskill, or hire our team to ship your product.",
      heroImage:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1600&q=80",
      sortOrder: 3,
      features: [
        { title: "Web Development", description: "Modern websites and full-stack apps — taught and built." },
        { title: "App Development", description: "Mobile-ready products and cross-platform applications." },
        { title: "Graphic Designing", description: "Brand identity, UI visuals, and creative assets." },
        { title: "Digital Marketing", description: "Campaigns, SEO, and growth systems that convert." },
        { title: "AI Automations", description: "Workflows and agents that save time and scale operations." },
        { title: "Learn or Hire", description: "Course packages for students and project packages for clients." },
      ],
      faqs: [
        { q: "Do you teach and build?", a: "Yes. Enroll in training courses or hire us for client projects." },
        { q: "What tech stacks do you use?", a: "Modern web stacks (Next.js, React, Node), mobile, design tools, and AI automation platforms." },
        { q: "Can I start with a consultation?", a: "Absolutely — submit a project or course inquiry and we'll follow up." },
      ],
    },
  });

  async function seedPlans(
    serviceId: string,
    plans: Array<{
      name: string;
      badge?: string;
      classesOrHours?: string;
      durationMins?: number;
      features: string[];
      featured?: boolean;
      gbp: number;
      sortOrder: number;
    }>
  ) {
    for (const p of plans) {
      const existing = await prisma.plan.findFirst({
        where: { serviceId, name: p.name },
      });
      const plan =
        existing ??
        (await prisma.plan.create({
          data: {
            serviceId,
            name: p.name,
            badge: p.badge,
            classesOrHours: p.classesOrHours,
            durationMins: p.durationMins,
            features: p.features,
            featured: p.featured ?? false,
            sortOrder: p.sortOrder,
          },
        }));

      for (const price of pricesFromGbp(p.gbp)) {
        await prisma.planPrice.upsert({
          where: {
            planId_currencyCode: {
              planId: plan.id,
              currencyCode: price.currencyCode,
            },
          },
          update: { amount: price.amount },
          create: {
            planId: plan.id,
            currencyCode: price.currencyCode,
            amount: price.amount,
          },
        });
      }
    }
  }

  await seedPlans(quran.id, [
    {
      name: "Standard Plan",
      classesOrHours: "8 Classes",
      durationMins: 30,
      features: ["8 Classes Package", "30 Min Duration Per Class", "One-on-One Sessions"],
      gbp: 30,
      sortOrder: 1,
    },
    {
      name: "Gold Plan",
      badge: "Discounted",
      classesOrHours: "16 Classes",
      durationMins: 30,
      features: ["16 Classes", "Clear commitment discount", "Strong value for parents"],
      featured: true,
      gbp: 45,
      sortOrder: 2,
    },
    {
      name: "Premium Plan",
      badge: "Best Value",
      classesOrHours: "20 Classes",
      durationMins: 30,
      features: ["20 Classes", "Lowest price per class", "Best for Hifz / Tajweed"],
      gbp: 55,
      sortOrder: 3,
    },
  ]);

  await seedPlans(tuition.id, [
    {
      name: "Starter Pack",
      classesOrHours: "4 Hours",
      durationMins: 60,
      features: ["4 hours of tutoring", "Subject of your choice", "Flexible scheduling"],
      gbp: 100,
      sortOrder: 1,
    },
    {
      name: "Progress Pack",
      badge: "Popular",
      classesOrHours: "8 Hours",
      durationMins: 60,
      features: ["8 hours of tutoring", "Exam-focused support", "Progress check-ins"],
      featured: true,
      gbp: 180,
      sortOrder: 2,
    },
    {
      name: "Excellence Pack",
      badge: "Best Value",
      classesOrHours: "16 Hours",
      durationMins: 60,
      features: ["16 hours of tutoring", "Priority matching", "Monthly parent summary"],
      gbp: 320,
      sortOrder: 3,
    },
  ]);

  await seedPlans(it.id, [
    {
      name: "Starter",
      badge: "Learn or Build",
      classesOrHours: "Foundation",
      features: [
        "Intro course module OR landing-page project",
        "Web / design / marketing basics",
        "1 consultation call",
      ],
      gbp: 199,
      sortOrder: 1,
    },
    {
      name: "Growth",
      badge: "Most Popular",
      classesOrHours: "Intermediate",
      features: [
        "Full skill track OR multi-page product",
        "App / automation / campaigns options",
        "Weekly reviews",
      ],
      featured: true,
      gbp: 499,
      sortOrder: 2,
    },
    {
      name: "Pro",
      badge: "Complete",
      classesOrHours: "Advanced",
      features: [
        "Advanced training OR end-to-end delivery",
        "AI automations & scaling support",
        "Priority support",
      ],
      gbp: 999,
      sortOrder: 3,
    },
  ]);

  const settings: Record<string, string> = {
    brandName: "Al-Hadi Institute",
    tagline: "Faith, learning, and technology — guided with excellence",
    whatsapp: process.env.WHATSAPP_NUMBER || "447774874052",
    contactEmail: process.env.CONTACT_EMAIL || "info@alhadiinstitute.com",
    countryBackground:
      "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=2000&q=80",
    homeHeroImage:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=2000&q=80",
  };

  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  const email = process.env.ADMIN_EMAIL || "admin@alhadiinstitute.com";
  const password = process.env.ADMIN_PASSWORD || "change-me";
  const hash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { password: hash, role: "ADMIN", emailVerified: new Date() },
    create: {
      email,
      name: "Admin",
      password: hash,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  console.log("Seed complete.");
  console.log(`Admin: ${email} / ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
