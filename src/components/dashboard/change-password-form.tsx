"use client";

import { useState, useTransition } from "react";
import { changePasswordAction } from "@/actions/account";
import { Button } from "@/components/ui/button";

export function ChangePasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="max-w-md space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        setError(null);
        setMessage(null);
        startTransition(async () => {
          const result = await changePasswordAction(formData);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          setMessage(result.message || "Password updated.");
          form.reset();
        });
      }}
    >
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">Current password</span>
        <input
          name="currentPassword"
          type="password"
          required
          className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">New password</span>
        <input
          name="nextPassword"
          type="password"
          required
          minLength={8}
          className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3"
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-teal dark:text-gold">{message}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Update password"}
      </Button>
    </form>
  );
}
