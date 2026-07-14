'use client';

import Link from 'next/link';
import { LayoutDashboard, Briefcase, Calendar, Bell, User, Search, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const COLORS = {
  yellow: '#facc15',
  midnight: '#1e3a8a',
};

export type CandidateTab = 'apercu' | 'candidatures' | 'entretiens' | 'notifications';

export const CANDIDATE_TABS: { key: CandidateTab; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'apercu', label: 'Aperçu', icon: LayoutDashboard },
  { key: 'candidatures', label: 'Mes candidatures', icon: Briefcase },
  { key: 'entretiens', label: 'Mes entretiens', icon: Calendar },
  { key: 'notifications', label: 'Notifications', icon: Bell },
];

interface CandidateSidebarProps {
  activeTab: CandidateTab;
  onSelect: (tab: CandidateTab) => void;
  open: boolean;
  onClose: () => void;
}

export default function CandidateSidebar({ activeTab, onSelect, open, onClose }: CandidateSidebarProps) {
  const { user, logout } = useAuth();
  const initial = user?.nom?.charAt(0).toUpperCase() || 'C';

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
            <p className="truncate text-sm font-semibold text-gray-900">{user?.nom || 'Candidat'}</p>
            <p className="truncate text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {CANDIDATE_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  onSelect(tab.key);
                  onClose();
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                  active ? 'font-bold' : 'font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                style={active ? { backgroundColor: COLORS.yellow, color: COLORS.midnight } : undefined}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}

          <Link
            href="/candidat/profil"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <User size={18} />
            Mon profil
          </Link>

          <Link
            href="/offres"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <Search size={18} />
            Voir les offres
          </Link>
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
