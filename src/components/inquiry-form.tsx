"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { submitInquiryAction } from "@/actions";
import { Button } from "@/components/ui/button";

const COURSES_BY_SERVICE: Record<string, string[]> = {
  quran: ["Nazra (Quran Reading)", "Hifz (Memorization)", "Tajweed (Pronunciation)", "Islamic Studies"],
  tuition: ["Maths", "English", "Chemistry", "Biology", "Physics", "Economics", "Other"],
  it: ["Web Development", "App Development", "Graphic Designing", "Digital Marketing", "AI Automations", "Client Project"],
};

export function InquiryForm({
  serviceSlug,
  services,
  planId,
  countryCode,
  whatsapp,
  defaultType = "DEMO",
}: {
  serviceSlug?: string;
  services?: Array<{ slug: string; title: string }>;
  planId?: string;
  countryCode?: string;
  whatsapp?: string;
  defaultType?: "DEMO" | "ENROLL" | "PROJECT" | "COURSE";
}) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [selectedService, setSelectedService] = useState(
    serviceSlug || services?.[0]?.slug || "quran"
  );
  const courses = COURSES_BY_SERVICE[selectedService] ?? [];
  const showServiceSelector = !serviceSlug && services && services.length > 0;

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await submitInquiryAction(formData);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setDone(true);
      toast.success("Request sent successfully!");
    });
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-gold/30 bg-card p-8 text-center">
        <h3 className="font-display text-2xl">Request Sent Successfully!</h3>
        <p className="mt-2 text-muted">We will contact you shortly.</p>
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-block"
          >
            <Button variant="secondary">Chat on WhatsApp</Button>
          </a>
        )}
      </div>
    );
  }

  return (
    <form action={onSubmit} className="space-y-4 rounded-3xl border border-foreground/10 bg-card p-6 sm:p-8">
      {!showServiceSelector && (
        <input type="hidden" name="serviceSlug" value={selectedService} />
      )}
      <input type="hidden" name="planId" value={planId || ""} />
      <input type="hidden" name="countryCode" value={countryCode || ""} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Full Name</span>
          <input
            name="name"
            required
            className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3 outline-none focus:ring-2 focus:ring-gold/50"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Phone (WhatsApp)</span>
          <input
            name="phone"
            required
            className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3 outline-none focus:ring-2 focus:ring-gold/50"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">Email Address</span>
        <input
          type="email"
          name="email"
          required
          className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3 outline-none focus:ring-2 focus:ring-gold/50"
        />
      </label>

      {showServiceSelector && (
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Select Service</span>
          <select
            name="serviceSlug"
            value={selectedService}
            onChange={(event) => setSelectedService(event.target.value)}
            className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3 outline-none focus:ring-2 focus:ring-gold/50"
          >
            {services.map((service) => (
              <option key={service.slug} value={service.slug}>
                {service.title}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Select Course / Subject</span>
          <select
            name="course"
            className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3 outline-none focus:ring-2 focus:ring-gold/50"
            key={selectedService}
            defaultValue=""
          >
            <option value="">Choose...</option>
            {courses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Age Group</span>
          <select
            name="ageGroup"
            className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3 outline-none focus:ring-2 focus:ring-gold/50"
            defaultValue=""
          >
            <option value="">Select...</option>
            <option value="Kids (4-12 Years)">Kids (4-12 Years)</option>
            <option value="Teens (13-17 Years)">Teens (13-17 Years)</option>
            <option value="Adults (18+ Years)">Adults (18+ Years)</option>
          </select>
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">Inquiry Type</span>
        <select
          name="type"
          defaultValue={defaultType}
          className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3 outline-none focus:ring-2 focus:ring-gold/50"
        >
          <option value="DEMO">Demo Class</option>
          <option value="ENROLL">Enroll in Plan</option>
          <option value="COURSE">Course Inquiry</option>
          <option value="PROJECT">Client Project</option>
        </select>
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">Message</span>
        <textarea
          name="message"
          rows={4}
          className="w-full rounded-xl border border-foreground/15 bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-gold/50"
          placeholder="Tell us about your goals..."
        />
      </label>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" disabled={pending} className="min-w-40">
          {pending ? "Sending..." : "Submit Request"}
        </Button>
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
          >
            <Button type="button" variant="outline">
              Chat on WhatsApp
            </Button>
          </a>
        )}
      </div>
    </form>
  );
}
