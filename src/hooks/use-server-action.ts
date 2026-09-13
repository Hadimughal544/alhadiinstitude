"use client";

import { useState, useTransition } from "react";
import type { ActionResult } from "@/lib/action-result";

/**
 * Shared pending/error/success plumbing for the app's server actions, which all
 * return ActionResult. Replaces the useTransition + useState duplication that
 * every admin/dashboard form previously reimplemented on its own.
 */
export function useServerAction(action: (formData: FormData) => Promise<ActionResult>) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(formData: FormData, onSuccess?: (result: Extract<ActionResult, { ok: true }>) => void) {
    setError(null);
    startTransition(async () => {
      const result = await action(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSuccess?.(result);
    });
  }

  function reset() {
    setError(null);
  }

  return { run, pending, error, reset };
}
