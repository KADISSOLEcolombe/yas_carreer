"use client";

import { LayoutDashboard, FileText, CalendarClock, UserRound, Bell } from "lucide-react";
import { RouteGuard } from "@/components/shared/route-guard";
import { DashboardShell, type DashboardNavItem } from "@/components/shared/dashboard-shell";

const navItems: DashboardNavItem[] = [
  { href: "/candidat/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/candidat/candidatures", label: "Mes candidatures", icon: FileText },
  { href: "/candidat/entretiens", label: "Mes entretiens", icon: CalendarClock },
  { href: "/candidat/notifications", label: "Notifications", icon: Bell },
  { href: "/candidat/profil", label: "Mon profil", icon: UserRound },
];

export default function CandidatLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allow={["candidat"]}>
      <DashboardShell navItems={navItems}>{children}</DashboardShell>
    </RouteGuard>
  );
}
