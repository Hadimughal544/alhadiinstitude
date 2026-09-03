"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guards";

export async function disconnectInstituteGoogleFormAction(): Promise<void> {
  await requireAdmin();
  await prisma.googleConnection.deleteMany({});
  revalidatePath("/admin/settings/google");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/timetable");
  revalidatePath("/admin");
}
