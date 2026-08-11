"use client";

import {
  LayoutDashboard,
  CalendarClock,
  CalendarCheck,
  Users,
  Bell,
} from "lucide-react";
import { RouteGuard } from "@/components/shared/route-guard";
import { WorkspaceShell } from "@/components/shared/workspace-shell";

const mainNav = [
  { href: "/superviseur/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/superviseur/disponibilites", label: "Disponibilités", icon: CalendarCheck },
  { href: "/superviseur/entretiens", label: "Entretiens", icon: CalendarClock },
  { href: "/superviseur/employes", label: "Mes collaborateurs", icon: Users },
  { href: "/superviseur/notifications", label: "Notifications", icon: Bell },
];

export default function SuperviseurLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allow={["superviseur"]}>
      <WorkspaceShell
        homeHref="/superviseur/dashboard"
        workspaceLabel="Espace Superviseur"
        mainNav={mainNav}
      >
        {children}
      </WorkspaceShell>
    </RouteGuard>
  );
}
