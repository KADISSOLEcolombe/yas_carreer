'use client';

import Link from 'next/link';
import { LogOut, Search, type LucideIcon } from 'lucide-react';
import { LayoutDashboard, Briefcase, Calendar, Bell, User, Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import NotificationBell from '@/components/NotificationBell';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type CandidateTab = 'apercu' | 'candidatures' | 'favoris' | 'entretiens' | 'notifications' | 'profil';

export const CANDIDATE_TABS: { key: CandidateTab; label: string; icon: LucideIcon }[] = [
  { key: 'apercu', label: 'Aperçu', icon: LayoutDashboard },
  { key: 'candidatures', label: 'Mes candidatures', icon: Briefcase },
  { key: 'favoris', label: 'Mes favoris', icon: Heart },
  { key: 'entretiens', label: 'Mes entretiens', icon: Calendar },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'profil', label: 'Mon profil', icon: User },
];

interface CandidateSidebarProps {
  activeTab: CandidateTab;
  onSelect: (tab: CandidateTab) => void;
  open: boolean;
  onClose: () => void;
}

export default function CandidateSidebar({ activeTab, onSelect, open, onClose }: CandidateSidebarProps) {
  const { user, logout } = useAuth();

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} />}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 transform flex-col border border-border bg-background transition-transform lg:static lg:translate-x-0 lg:rounded-2xl lg:shadow-sm',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-5">
          <div className="flex min-w-0 items-center gap-3">
            <img src="/jm.svg" alt="YAS" className="h-10 w-auto shrink-0" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{user?.nom || 'Candidat'}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <NotificationBell />
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {CANDIDATE_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  onSelect(tab.key);
                  onClose();
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors',
                  active
                    ? 'bg-primary font-bold text-primary-foreground'
                    : 'font-medium text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-border p-4">
          <Link
            href="/offres"
            onClick={onClose}
            className={cn(buttonVariants({ variant: 'outline' }), 'w-full justify-start gap-2')}
          >
            <Search size={16} />
            Voir les offres
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={logout}
          >
            <LogOut size={16} />
            Déconnexion
          </Button>
        </div>
      </aside>
    </>
  );
}
