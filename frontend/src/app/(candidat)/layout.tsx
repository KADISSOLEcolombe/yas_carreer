"use client";

import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Heart,
  CalendarClock,
  UserRound,
  Settings,
  Search,
} from "lucide-react";
import { RouteGuard } from "@/components/shared/route-guard";
import { WorkspaceShell } from "@/components/shared/workspace-shell";

const mainNav = [
  { href: "/candidat/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/candidat/candidatures", label: "Mes candidatures", icon: FileText },
  { href: "/offres", label: "Offres", icon: Briefcase },
  { href: "/candidat/favoris", label: "Mes favoris", icon: Heart },
  { href: "/candidat/entretiens", label: "Mes entretiens", icon: CalendarClock },
  { href: "/candidat/profil", label: "Mon profil", icon: UserRound },
];

const otherNav = [
  { href: "/changer-mot-de-passe", label: "Paramètres", icon: Settings },
];

export default function CandidatLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allow={["candidat"]}>
      <WorkspaceShell
        homeHref="/candidat/dashboard"
        workspaceLabel="Espace Candidat"
        tagline="Voici un aperçu de vos candidatures et opportunités."
        mainNav={mainNav}
        otherNav={otherNav}
        primaryCta={{ href: "/offres", label: "Explorer les offres", icon: Search }}
      >
        {children}
      </WorkspaceShell>
    </RouteGuard>
  );
}
