"use client";

import { useState } from "react";
import { submitTeacherApplicationAction } from "@/actions";
import { useServerAction } from "@/hooks/use-server-action";
import { Button } from "@/components/ui/button";

export function TeacherApplicationForm({
  serviceSlug,
  onDone,
}: {
  serviceSlug: string;
  onDone?: () => void;
}) {
  const { run, pending, error } = useServerAction(submitTeacherApplicationAction);
  const [done, setDone] = useState(false);

  function onSubmit(formData: FormData) {
    run(formData, () => {
      setDone(true);
      onDone?.();
    });
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-gold/30 bg-card p-6 text-center">
        <h3 className="font-display text-xl font-semibold">Application Submitted!</h3>
        <p className="mt-2 text-sm text-muted">
          Thank you for applying. We&apos;ve sent a confirmation to your email, and our team will be in touch soon.
        </p>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <input type="hidden" name="serviceSlug" value={serviceSlug} />

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

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

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">Subject / Area You Want to Teach</span>
        <input
          name="subject"
          placeholder="e.g. Tajweed, Maths, Web Development..."
          className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3 outline-none focus:ring-2 focus:ring-gold/50"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">Qualification / Experience</span>
        <input
          name="experience"
          placeholder="e.g. 3 years teaching experience, degree, certifications..."
          className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3 outline-none focus:ring-2 focus:ring-gold/50"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">Message (optional)</span>
        <textarea
          name="message"
          rows={4}
          className="w-full rounded-xl border border-foreground/15 bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-gold/50"
          placeholder="Tell us a bit about yourself..."
        />
      </label>

      <div className="pt-2">
        <Button type="submit" disabled={pending} className="min-w-40">
          {pending ? "Submitting..." : "Submit Application"}
        </Button>
      </div>
    </form>
  );
}
