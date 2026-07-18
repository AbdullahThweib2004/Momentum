import {
  LayoutDashboard,
  FileText,
  Sparkles,
  Activity,
  History,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Overview & activity",
  },
  {
    label: "Drafts",
    href: "/drafts",
    icon: FileText,
    description: "Review & edit posts",
  },
  {
    label: "Interests",
    href: "/interests",
    icon: Sparkles,
    description: "Tracked topics",
  },
  {
    label: "Engagement Log",
    href: "/engagement",
    icon: Activity,
    description: "What you engaged with",
  },
  {
    label: "History",
    href: "/history",
    icon: History,
    description: "Published posts & analytics",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Voice & content pillars",
  },
];
