"use client";

import {
  LayoutDashboard,
  Briefcase,
  FileCheck,
  CalendarClock,
  Plus,
  Bell,
} from "lucide-react";
import { RouteGuard } from "@/components/shared/route-guard";
import { WorkspaceShell } from "@/components/shared/workspace-shell";

const mainNav = [
  { href: "/rh/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/rh/candidatures", label: "Candidatures", icon: FileCheck },
  { href: "/rh/offres", label: "Offres", icon: Briefcase },
  { href: "/rh/entretiens", label: "Entretiens", icon: CalendarClock },
  { href: "/rh/notifications", label: "Notifications", icon: Bell },
];

export default function RhLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allow={["rh", "admin"]}>
      <WorkspaceShell
        homeHref="/rh/dashboard"
        workspaceLabel="Espace RH"
        mainNav={mainNav}
        primaryCta={{
          href: "/rh/offres",
          label: "Nouvelle offre",
          icon: Plus,
        }}
      >
        {children}
      </WorkspaceShell>
    </RouteGuard>
  );
}
