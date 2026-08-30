"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTeacher } from "@/lib/auth-guards";

export async function disconnectTeacherGoogleFormAction() {
  const session = await requireTeacher();
  await prisma.googleConnection.deleteMany({ where: { userId: session.user.id } });
  revalidatePath("/teacher/account");
  revalidatePath("/admin/timetable");
}
