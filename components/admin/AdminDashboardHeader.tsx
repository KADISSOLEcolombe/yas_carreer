'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Settings, BarChart3 } from 'lucide-react';

const COLORS = {
  midnight: '#1e3a8a',
};

const TABS = [
  { href: '/admin/dashboard', label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: '/admin/accounts', label: 'Utilisateurs', icon: Users },
  { href: '/admin/parametres', label: 'Paramètres', icon: Settings },
  { href: '/admin/statistiques', label: 'Statistiques', icon: BarChart3 },
];

export default function AdminDashboardHeader() {
  const pathname = usePathname();

  return (
    <>
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: COLORS.midnight }}>
          Administration
        </h1>
        <p className="text-gray-500">Gestion de la plateforme · Admin YAS</p>
      </div>

      {/* Barre d'onglets */}
      <div className="flex flex-wrap gap-2 rounded-2xl bg-white p-2 shadow-sm">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                active ? 'text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={active ? { backgroundColor: COLORS.midnight } : undefined}
            >
              <Icon size={16} />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </>
  );
}
