import type { Role } from "@/generated/prisma/client";

export type PortalRole = "ADMIN" | "TEACHER" | "STUDENT";

export function dashboardPathForRole(role: string | undefined | null): string {
  if (role === "ADMIN") return "/admin";
  if (role === "TEACHER") return "/teacher";
  if (role === "STUDENT") return "/student";
  return "/home";
}

export function isPortalRole(role: string | undefined | null): role is PortalRole {
  return role === "ADMIN" || role === "TEACHER" || role === "STUDENT";
}

export function pathMatchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function roleLabel(role: Role): string {
  if (role === "TEACHER") return "Teacher";
  if (role === "STUDENT") return "Student";
  if (role === "ADMIN") return "Admin";
  return "User";
}
