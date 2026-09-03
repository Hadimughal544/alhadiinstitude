"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guards";
import { hashPassword, verifyPassword } from "@/lib/passwords";
import { toActionError, type ActionResult } from "@/lib/action-result";

const schema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  nextPassword: z.string().min(8, "New password must be at least 8 characters."),
});

export async function changePasswordAction(formData: FormData): Promise<ActionResult> {
  try {
    const session = await requireSession();
    const parsed = schema.safeParse({
      currentPassword: formData.get("currentPassword"),
      nextPassword: formData.get("nextPassword"),
    });
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message || "Check the form fields." };
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user?.password) {
      return { ok: false, error: "Account not found." };
    }

    const matches = await verifyPassword(parsed.data.currentPassword, user.password);
    if (!matches) {
      return { ok: false, error: "Current password is incorrect." };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: await hashPassword(parsed.data.nextPassword) },
    });

    return { ok: true, message: "Password updated." };
  } catch (error) {
    return { ok: false, error: toActionError(error, "Could not update the password.") };
  }
}
