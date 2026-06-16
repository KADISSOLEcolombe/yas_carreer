'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  Bell,
  LogOut,
  Menu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../lib/constants';

const NAV_ITEMS = [
  { href: '/rh/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/rh/offres', label: 'Offres d\'emploi', icon: Briefcase },
  { href: '/rh/candidatures', label: 'Candidatures', icon: Users },
  { href: '/rh/entretiens', label: 'Entretiens', icon: Calendar },
  { href: '/rh/notifications', label: 'Notifications', icon: Bell },
];

export default function RHLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-gray-200">
          <Link href="/rh/dashboard" className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-md flex items-center justify-center text-gray-900 font-bold"
              style={{ backgroundColor: COLORS.yellow }}
            >
              RH
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: COLORS.midnight }}>
                Espace RH
              </p>
              <p className="text-xs text-gray-500">YAS Togo</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? 'text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                style={active ? { backgroundColor: COLORS.yellow } : undefined}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="px-4 py-3 mb-2">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.nom}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
              {user?.role === 'ADMIN' ? 'Administrateur' : 'Recruteur RH'}
            </span>
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

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600">
            <Menu size={22} />
          </button>
          <span className="font-semibold" style={{ color: COLORS.midnight }}>
            Espace RH
          </span>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
