import {
  LayoutDashboard,
  MessageSquare,
  Newspaper,
  Layers,
  CreditCard,
  Globe2,
  Settings,
  Users,
  GraduationCap,
  CalendarDays,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PortalRole } from "@/lib/roles";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

export type DashboardConfig = {
  title: string;
  homeHref: string;
  viewSiteHref?: string;
  nav: DashboardNavItem[];
};

export const DASHBOARD_CONFIG: Record<PortalRole, DashboardConfig> = {
  ADMIN: {
    title: "Admin",
    homeHref: "/admin",
    viewSiteHref: "/home",
    nav: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
      { href: "/admin/teachers", label: "Teachers", icon: Users },
      { href: "/admin/students", label: "Students", icon: GraduationCap },
      { href: "/admin/timetable", label: "Timetable", icon: CalendarDays },
      { href: "/admin/blogs", label: "Blogs", icon: Newspaper },
      { href: "/admin/services", label: "Services", icon: Layers },
      { href: "/admin/plans", label: "Plans", icon: CreditCard },
      { href: "/admin/countries", label: "Countries", icon: Globe2 },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
  TEACHER: {
    title: "Teacher",
    homeHref: "/teacher",
    nav: [
      { href: "/teacher", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/teacher/timetable", label: "Timetable", icon: CalendarDays },
      { href: "/teacher/account", label: "Account", icon: UserRound },
    ],
  },
  STUDENT: {
    title: "Student",
    homeHref: "/student",
    nav: [
      { href: "/student", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/student/timetable", label: "Timetable", icon: CalendarDays },
      { href: "/student/account", label: "Account", icon: UserRound },
    ],
  },
};
