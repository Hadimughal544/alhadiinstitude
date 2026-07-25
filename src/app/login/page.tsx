"use client";

import { FormEvent, useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      setError(null);
      const result = await signIn("credentials", {
        email: String(formData.get("email") || ""),
        password: String(formData.get("password") || ""),
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }

      window.location.assign("/admin");
    });
  }

  return (
    <div className="mesh-bg flex min-h-screen items-center justify-center px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <form
        className="w-full max-w-md rounded-3xl border border-foreground/10 bg-card p-8 shadow-xl"
        onSubmit={handleSubmit}
      >
        <BrandLogo href="/" size="md" />
        <h1 className="mt-4 text-xl font-semibold">Admin Login</h1>
        <label className="mt-6 block text-sm">
          <span className="mb-1.5 block font-medium">Email</span>
          <input
            name="email"
            type="email"
            required
            className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3 outline-none focus:ring-2 focus:ring-gold/50"
          />
        </label>
        <label className="mt-4 block text-sm">
          <span className="mb-1.5 block font-medium">Password</span>
          <input
            name="password"
            type="password"
            required
            className="h-11 w-full rounded-xl border border-foreground/15 bg-background px-3 outline-none focus:ring-2 focus:ring-gold/50"
          />
        </label>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <Button type="submit" className="mt-6 w-full" disabled={pending}>
          {pending ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
