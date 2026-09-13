"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useServerAction } from "@/hooks/use-server-action";
import type { ActionResult } from "@/lib/action-result";

/**
 * Shared row-delete control for admin DataTable pages — a trash icon that opens
 * a ConfirmDialog and calls the given id-bound server action.
 */
export function DeleteRowButton({
  id,
  action,
  title = "Delete this record?",
  description = "This action cannot be undone.",
}: {
  id: string;
  action: (id: string) => Promise<ActionResult>;
  title?: string;
  description?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { run, pending } = useServerAction(async () => action(id));

  function onConfirm() {
    run(new FormData(), () => {
      setOpen(false);
      toast.success("Deleted.");
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-destructive-muted hover:text-destructive"
        aria-label="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
        confirmLabel="Delete"
        pending={pending}
        onConfirm={onConfirm}
      />
    </>
  );
}
