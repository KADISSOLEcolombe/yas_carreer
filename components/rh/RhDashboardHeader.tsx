'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, FileText, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../NotificationBell';

const COLORS = {
  midnight: '#1e3a8a',
  yellow: '#facc15',
};

const TABS = [
  { href: '/rh/dashboard', label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: '/rh/offres', label: 'Offres', icon: Briefcase },
  { href: '/rh/candidatures', label: 'Candidatures', icon: FileText },
  { href: '/rh/entretiens', label: 'Entretiens', icon: Calendar },
];

export default function RhDashboardHeader() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <>
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: COLORS.midnight }}>
            Tableau de bord RH
          </h1>
          <p className="text-gray-500">Bienvenue{user?.nom ? `, ${user.nom}` : ''}</p>
        </div>
        <NotificationBell />
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
