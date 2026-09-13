"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { TeacherApplicationForm } from "@/components/teacher-application-form";
import { Button } from "@/components/ui/button";

export function JoinAsTeacherModal({
  serviceSlug,
  className,
}: {
  serviceSlug: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" size="lg" className={className} onClick={() => setOpen(true)}>
        Join Us as a Teacher/Tutor
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Join Us as a Teacher/Tutor"
        description="Fill in your details and our team will review your application."
      >
        <TeacherApplicationForm serviceSlug={serviceSlug} />
      </Dialog>
    </>
  );
}
