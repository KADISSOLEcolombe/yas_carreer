'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  Bell,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import DashboardShell from '@/components/DashboardShell';

const NAV_ITEMS = [
  { href: '/rh/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/rh/offres', label: "Offres d'emploi", icon: Briefcase },
  { href: '/rh/candidatures', label: 'Candidatures', icon: Users },
  { href: '/rh/entretiens', label: 'Entretiens', icon: Calendar },
  { href: '/rh/notifications', label: 'Notifications', icon: Bell },
];

export default function RHLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <DashboardShell
      title="Espace RH"
      homeHref="/rh/dashboard"
      navItems={NAV_ITEMS}
      pathname={pathname}
      userName={user?.nom}
      userEmail={user?.email}
      userBadge={user?.role === 'ADMIN' ? 'Administrateur' : 'Recruteur RH'}
      onLogout={logout}
      sidebarOpen={sidebarOpen}
      onSidebarOpenChange={setSidebarOpen}
    >
      {children}
    </DashboardShell>
  );
}
