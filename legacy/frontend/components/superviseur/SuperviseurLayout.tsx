'use client';

import { useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ListChecks, Star, CalendarDays } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import DashboardShell from '@/components/DashboardShell';

const NAV_ITEMS = [
  { href: '/superviseur/dashboard', label: "Vue d'ensemble", icon: LayoutDashboard, exact: true },
  { href: '/superviseur/a-evaluer', label: 'À évaluer', icon: ListChecks },
  { href: '/superviseur/evaluations', label: 'Mes évaluations', icon: Star },
  { href: '/superviseur/entretiens', label: 'Mes entretiens', icon: CalendarDays },
];

export default function SuperviseurLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <DashboardShell
      title="Espace Superviseur"
      homeHref="/superviseur/dashboard"
      navItems={NAV_ITEMS}
      pathname={pathname}
      userName={user?.nom}
      userEmail={user?.email}
      userBadge="Superviseur"
      onLogout={logout}
      sidebarOpen={sidebarOpen}
      onSidebarOpenChange={setSidebarOpen}
    >
      {children}
    </DashboardShell>
  );
}
