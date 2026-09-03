"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sheet({
  open,
  onClose,
  children,
  side = "left",
  className,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: "left" | "right";
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Close menu"
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "absolute inset-y-0 flex w-[min(280px,85vw)] flex-col border-border bg-sidebar shadow-xl transition-transform duration-200",
          side === "left" ? "left-0 border-r" : "right-0 border-l",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-4">
      <div className="min-w-0 flex-1">{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-foreground/5"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
