import "server-only";

import { auth } from "@/lib/auth";
import type { Role } from "@/generated/prisma/client";

export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireRole(...roles: Role[]) {
  const session = await requireSession();
  if (!roles.includes(session.user.role)) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireAdmin() {
  return requireRole("ADMIN");
}

export async function requireTeacher() {
  return requireRole("TEACHER");
}

export async function requireStudent() {
  return requireRole("STUDENT");
}
