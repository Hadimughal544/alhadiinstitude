"use client";

import { Dialog } from "@/components/ui/dialog";

export function AdminModal({
  open,
  onClose,
  title,
  description,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title} description={description} wide={wide}>
      {children}
    </Dialog>
  );
}
