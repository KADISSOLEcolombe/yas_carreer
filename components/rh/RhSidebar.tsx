'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  Bell,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const COLORS = {
  yellow: '#FFD100',
  midnight: '#00377D',
};

const NAV_ITEMS = [
  { href: '/rh', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
  { href: '/rh/offres', label: 'Offres d\'emploi', icon: Briefcase },
  { href: '/rh/candidatures', label: 'Candidatures', icon: Users },
  { href: '/rh/entretiens', label: 'Entretiens', icon: Calendar, soon: true },
  { href: '/rh/notifications', label: 'Notifications', icon: Bell, soon: true },
  { href: '/rh/statistiques', label: 'Statistiques', icon: BarChart3, soon: true },
];

export default function RhSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      <div className="p-6 border-b border-gray-100">
        <Link href="/rh" className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-md flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: COLORS.midnight }}
          >
            RH
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: COLORS.midnight }}>Espace RH</p>
            <p className="text-xs text-gray-500">YAS Togo</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.soon ? '#' : item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'text-gray-900 shadow-sm'
                  : item.soon
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              style={isActive ? { backgroundColor: COLORS.yellow } : undefined}
              onClick={item.soon ? (e) => e.preventDefault() : undefined}
            >
              <item.icon size={18} />
              <span className="flex-1">{item.label}</span>
              {item.soon && (
                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Bientôt</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="px-4 py-3 mb-2">
          <p className="text-sm font-semibold text-gray-900 truncate">{user?.nom}</p>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
