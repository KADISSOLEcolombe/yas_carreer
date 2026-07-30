'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Briefcase, FileText, Settings, BarChart3 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import DashboardShell from '@/components/DashboardShell';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: '/admin/accounts', label: 'Utilisateurs', icon: Users },
  { href: '/admin/offres', label: 'Offres', icon: Briefcase },
  { href: '/admin/candidatures', label: 'Candidatures', icon: FileText },
  { href: '/admin/parametres', label: 'Paramètres', icon: Settings },
  { href: '/admin/statistiques', label: 'Statistiques', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') return;
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/admin/login');
    }
  }, [user, isLoading, router, pathname]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <div className="size-10 animate-spin rounded-full border-t-2 border-b-2 border-yas-midnight" />
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <DashboardShell
      title="Administration"
      homeHref="/admin/dashboard"
      navItems={NAV_ITEMS}
      pathname={pathname}
      userName={user.nom || 'Admin YAS'}
      userEmail={user.email}
      userBadge="Administrateur"
      onLogout={logout}
      sidebarOpen={sidebarOpen}
      onSidebarOpenChange={setSidebarOpen}
    >
      {children}
    </DashboardShell>
  );
}
