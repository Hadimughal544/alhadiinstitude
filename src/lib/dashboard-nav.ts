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
  ClipboardCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PortalRole } from "@/lib/roles";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

export type DashboardNavGroup = {
  label: string;
  items: DashboardNavItem[];
};

export type DashboardConfig = {
  title: string;
  homeHref: string;
  viewSiteHref?: string;
  accountHref?: string;
  groups: DashboardNavGroup[];
};

const ADMIN_GROUPS: DashboardNavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "People",
    items: [
      { href: "/admin/teachers", label: "Teachers", icon: Users },
      { href: "/admin/students", label: "Students", icon: GraduationCap },
    ],
  },
  {
    label: "Academics",
    items: [
      { href: "/admin/timetable", label: "Timetable", icon: CalendarDays },
      { href: "/admin/attendance", label: "Attendance", icon: ClipboardCheck },
    ],
  },
  {
    label: "Marketing",
    items: [
      { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
      { href: "/admin/blogs", label: "Blogs", icon: Newspaper },
      { href: "/admin/services", label: "Services", icon: Layers },
      { href: "/admin/plans", label: "Plans", icon: CreditCard },
      { href: "/admin/countries", label: "Countries", icon: Globe2 },
    ],
  },
  {
    label: "System",
    items: [{ href: "/admin/settings", label: "Settings", icon: Settings }],
  },
];

const TEACHER_GROUPS: DashboardNavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/teacher", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Schedule",
    items: [{ href: "/teacher/timetable", label: "Timetable", icon: CalendarDays }],
  },
  {
    label: "Account",
    items: [{ href: "/teacher/account", label: "Account", icon: UserRound }],
  },
];

const STUDENT_GROUPS: DashboardNavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/student", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Schedule",
    items: [{ href: "/student/timetable", label: "Timetable", icon: CalendarDays }],
  },
  {
    label: "Account",
    items: [{ href: "/student/account", label: "Account", icon: UserRound }],
  },
];

export const DASHBOARD_CONFIG: Record<PortalRole, DashboardConfig> = {
  ADMIN: {
    title: "Admin",
    homeHref: "/admin",
    viewSiteHref: "/home",
    accountHref: "/admin/settings",
    groups: ADMIN_GROUPS,
  },
  TEACHER: {
    title: "Teacher",
    homeHref: "/teacher",
    accountHref: "/teacher/account",
    groups: TEACHER_GROUPS,
  },
  STUDENT: {
    title: "Student",
    homeHref: "/student",
    accountHref: "/student/account",
    groups: STUDENT_GROUPS,
  },
};

export function getPageTitle(pathname: string, role: PortalRole): string {
  const config = DASHBOARD_CONFIG[role];
  for (const group of config.groups) {
    for (const item of group.items) {
      const active = item.exact
        ? pathname === item.href
        : pathname === item.href || pathname.startsWith(`${item.href}/`);
      if (active) return item.label;
    }
  }
  return config.title;
}
