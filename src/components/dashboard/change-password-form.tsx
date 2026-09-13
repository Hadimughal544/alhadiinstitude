"use client";

import { useState } from "react";
import { changePasswordAction } from "@/actions/account";
import { useServerAction } from "@/hooks/use-server-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, Field } from "@/components/ui/label";

export function ChangePasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const { run, pending, error } = useServerAction(changePasswordAction);

  return (
    <form
      className="max-w-md space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        setMessage(null);
        run(formData, (result) => {
          setMessage(result.message || "Password updated.");
          form.reset();
        });
      }}
    >
      <Field>
        <Label htmlFor="currentPassword">Current password</Label>
        <Input id="currentPassword" name="currentPassword" type="password" required />
      </Field>
      <Field>
        <Label htmlFor="nextPassword">New password</Label>
        <Input id="nextPassword" name="nextPassword" type="password" required minLength={8} />
      </Field>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-teal dark:text-gold">{message}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Update password"}
      </Button>
    </form>
  );
}
