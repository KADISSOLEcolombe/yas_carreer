'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Briefcase, FileText, Settings, BarChart3, LogOut, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const COLORS = {
  yellow: '#facc15',
  midnight: '#1e3a8a',
};

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: '/admin/accounts', label: 'Utilisateurs', icon: Users },
  { href: '/admin/offres', label: 'Offres', icon: Briefcase },
  { href: '/admin/candidatures', label: 'Candidatures', icon: FileText },
  { href: '/admin/parametres', label: 'Paramètres', icon: Settings },
  { href: '/admin/statistiques', label: 'Statistiques', icon: BarChart3 },
];

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const initial = user?.nom?.charAt(0).toUpperCase() || 'A';

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 transform flex-col border border-gray-100 bg-white transition-transform lg:static lg:translate-x-0 lg:rounded-2xl lg:shadow-sm ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-5 lg:hidden">
          <span className="font-bold" style={{ color: COLORS.midnight }}>
            Menu
          </span>
          <button onClick={onClose} className="p-1 text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Bloc profil */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-5">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold"
            style={{ backgroundColor: COLORS.yellow, color: COLORS.midnight }}
          >
            {initial}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">{user?.nom || 'Admin YAS'}</p>
            <p className="truncate text-xs text-gray-500">Administrateur</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                  active
                    ? 'font-bold'
                    : 'font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                style={active ? { backgroundColor: COLORS.yellow, color: COLORS.midnight } : undefined}
              >
                <Icon size={18} />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Déconnexion */}
        <div className="border-t border-gray-100 p-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
