"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  COUNTRY_COOKIE,
  CURRENCY_COOKIE,
  COOKIE_MAX_AGE,
} from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { InquiryStatus, InquiryType } from "@/generated/prisma/client";
import { GBP_FX, PLAN_CURRENCIES } from "@/lib/currencies";

export async function selectCountryAction(countryCode: string) {
  const country = await prisma.country.findFirst({
    where: { code: countryCode, active: true },
  });
  if (!country) throw new Error("Invalid country");

  const jar = await cookies();
  jar.set(COUNTRY_COOKIE, country.code, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  jar.set(CURRENCY_COOKIE, country.currencyCode, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  redirect("/home");
}

/** Clears region cookies so the country selector can be shown again. */
export async function clearCountryAction() {
  const jar = await cookies();
  jar.delete(COUNTRY_COOKIE);
  jar.delete(CURRENCY_COOKIE);
  redirect("/");
}

const inquirySchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email(),
  serviceSlug: z.string().min(1),
  planId: z.string().optional().nullable(),
  course: z.string().optional().nullable(),
  ageGroup: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
  type: z.enum(["DEMO", "ENROLL", "PROJECT", "COURSE"]),
  countryCode: z.string().optional().nullable(),
});

export async function submitInquiryAction(formData: FormData) {
  const parsed = inquirySchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    serviceSlug: formData.get("serviceSlug"),
    planId: formData.get("planId") || null,
    course: formData.get("course") || null,
    ageGroup: formData.get("ageGroup") || null,
    message: formData.get("message") || null,
    type: formData.get("type") || "DEMO",
    countryCode: formData.get("countryCode") || null,
  });

  if (!parsed.success) {
    return { ok: false as const, error: "Please check the form fields." };
  }

  await prisma.inquiry.create({
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      serviceSlug: parsed.data.serviceSlug,
      planId: parsed.data.planId || null,
      course: parsed.data.course || null,
      ageGroup: parsed.data.ageGroup || null,
      message: parsed.data.message || null,
      type: parsed.data.type as InquiryType,
      countryCode: parsed.data.countryCode || null,
    },
  });

  revalidatePath("/admin/inquiries");
  return { ok: true as const };
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function updateInquiryStatusAction(id: string, status: InquiryStatus) {
  await requireAdmin();
  await prisma.inquiry.update({ where: { id }, data: { status } });
  revalidatePath("/admin/inquiries");
}

export async function updateServiceAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const title = String(formData.get("title") || "");
  const subtitle = String(formData.get("subtitle") || "");
  const description = String(formData.get("description") || "");
  const heroImage = String(formData.get("heroImage") || "") || null;
  const active = formData.get("active") === "on" || formData.get("active") === "true";
  const featuresRaw = String(formData.get("features") || "[]");
  const faqsRaw = String(formData.get("faqs") || "[]");

  let features: unknown = [];
  let faqs: unknown = [];
  try {
    features = JSON.parse(featuresRaw);
    faqs = JSON.parse(faqsRaw);
  } catch {
    throw new Error("Invalid JSON in features or FAQs.");
  }

  await prisma.service.update({
    where: { id },
    data: { title, subtitle, description, heroImage, active, features: features as object, faqs: faqs as object },
  });
  revalidatePath("/admin/services");
  revalidatePath(`/services/${String(formData.get("slug") || "")}`);
}

export async function updatePlanAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const name = String(formData.get("name") || "");
  const badge = String(formData.get("badge") || "") || null;
  const classesOrHours = String(formData.get("classesOrHours") || "") || null;
  const durationMinsRaw = String(formData.get("durationMins") || "");
  const durationMins = durationMinsRaw ? Number(durationMinsRaw) : null;
  const featured = formData.get("featured") === "on" || formData.get("featured") === "true";
  const active = formData.get("active") === "on" || formData.get("active") === "true";
  const featuresRaw = String(formData.get("features") || "[]");
  let features: unknown = [];
  try {
    features = JSON.parse(featuresRaw);
  } catch {
    throw new Error("Invalid JSON in plan features.");
  }

  await prisma.plan.update({
    where: { id },
    data: {
      name,
      badge,
      classesOrHours,
      durationMins,
      featured,
      active,
      features: features as object,
    },
  });

  const currencies = [...PLAN_CURRENCIES];
  for (const code of currencies) {
    const raw = formData.get(`price_${code}`);
    if (raw === null || raw === "") continue;
    const amount = Number(raw);
    if (Number.isNaN(amount)) continue;
    await prisma.planPrice.upsert({
      where: { planId_currencyCode: { planId: id, currencyCode: code } },
      update: { amount },
      create: { planId: id, currencyCode: code, amount },
    });
  }

  revalidatePath("/admin/plans");
  revalidatePath("/pricing");
}

export async function updateCountryAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const name = String(formData.get("name") || "");
  const currencySymbol = String(formData.get("currencySymbol") || "");
  const flagEmoji = String(formData.get("flagEmoji") || "");
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const active = formData.get("active") === "on" || formData.get("active") === "true";

  await prisma.country.update({
    where: { id },
    data: { name, currencySymbol, flagEmoji, sortOrder, active },
  });
  revalidatePath("/admin/countries");
  revalidatePath("/");
}

export async function updateSettingsAction(formData: FormData) {
  await requireAdmin();
  const keys = [
    "brandName",
    "tagline",
    "whatsapp",
    "contactEmail",
    "countryBackground",
    "homeHeroImage",
  ];
  for (const key of keys) {
    const value = formData.get(key);
    if (typeof value !== "string") continue;
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/home");
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export async function createServiceAction(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") || "").trim();
  const subtitle = String(formData.get("subtitle") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const heroImage = String(formData.get("heroImage") || "") || null;
  let slug = String(formData.get("slug") || "").trim() || slugify(title);
  if (!title || !subtitle || !description || !slug) {
    throw new Error("Title, subtitle, description, and slug are required.");
  }

  const existing = await prisma.service.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const maxOrder = await prisma.service.aggregate({ _max: { sortOrder: true } });
  const service = await prisma.service.create({
    data: {
      title,
      subtitle,
      description,
      slug,
      heroImage,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
      features: [
        { title: "Feature one", description: "Describe this offering." },
        { title: "Feature two", description: "Describe this offering." },
        { title: "Feature three", description: "Describe this offering." },
      ],
      faqs: [
        { q: "How do I get started?", a: "Submit an inquiry and our team will contact you." },
      ],
    },
  });

  revalidatePath("/admin/services");
  revalidatePath("/home");
  redirect(`/admin/services/${service.id}`);
}

export async function createPlanAction(formData: FormData) {
  await requireAdmin();
  const serviceId = String(formData.get("serviceId") || "");
  const name = String(formData.get("name") || "").trim();
  const badge = String(formData.get("badge") || "") || null;
  const classesOrHours = String(formData.get("classesOrHours") || "") || null;
  const durationMinsRaw = String(formData.get("durationMins") || "");
  const durationMins = durationMinsRaw ? Number(durationMinsRaw) : null;
  const featured = formData.get("featured") === "on";
  const gbp = Number(formData.get("baseGbp") || 0);

  if (!serviceId || !name) throw new Error("Service and plan name are required.");

  const maxOrder = await prisma.plan.aggregate({
    where: { serviceId },
    _max: { sortOrder: true },
  });

  const plan = await prisma.plan.create({
    data: {
      serviceId,
      name,
      badge,
      classesOrHours,
      durationMins,
      featured,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
      features: ["Feature one", "Feature two", "Feature three"],
    },
  });

  const FX = GBP_FX;

  if (gbp > 0) {
    for (const [currencyCode, mult] of Object.entries(FX)) {
      await prisma.planPrice.create({
        data: {
          planId: plan.id,
          currencyCode,
          amount: Math.round(gbp * mult * 100) / 100,
        },
      });
    }
  }

  revalidatePath("/admin/plans");
  revalidatePath("/pricing");
  redirect(`/admin/plans/${plan.id}`);
}

export async function createCountryAction(formData: FormData) {
  await requireAdmin();
  const code = String(formData.get("code") || "")
    .trim()
    .toUpperCase();
  const name = String(formData.get("name") || "").trim();
  const currencyCode = String(formData.get("currencyCode") || "")
    .trim()
    .toUpperCase();
  const currencySymbol = String(formData.get("currencySymbol") || "").trim();
  const flagEmoji = String(formData.get("flagEmoji") || "🏳️").trim();
  const sortOrder = Number(formData.get("sortOrder") || 99);

  if (!code || !name || !currencyCode || !currencySymbol) {
    throw new Error("Code, name, currency code, and symbol are required.");
  }

  await prisma.country.create({
    data: {
      code,
      name,
      currencyCode,
      currencySymbol,
      flagEmoji,
      sortOrder,
      active: true,
    },
  });

  revalidatePath("/admin/countries");
  revalidatePath("/");
  redirect("/admin/countries");
}
