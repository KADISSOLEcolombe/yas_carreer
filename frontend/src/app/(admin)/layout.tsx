"use client";

import {
  LayoutDashboard,
  Users,
  Briefcase,
  Plus,
  Bell,
  Activity,
} from "lucide-react";
import { RouteGuard } from "@/components/shared/route-guard";
import { WorkspaceShell } from "@/components/shared/workspace-shell";

const mainNav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
  { href: "/admin/activite", label: "Traçabilité RH", icon: Activity },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/rh/dashboard", label: "Espace RH", icon: Briefcase },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allow={["admin"]}>
      <WorkspaceShell
        homeHref="/admin/dashboard"
        workspaceLabel="Administration"
        mainNav={mainNav}
        primaryCta={{
          href: "/admin/utilisateurs",
          label: "Nouvel utilisateur",
          icon: Plus,
        }}
      >
        {children}
      </WorkspaceShell>
    </RouteGuard>
  );
}
