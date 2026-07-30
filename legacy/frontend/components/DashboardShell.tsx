'use client';

import Link from 'next/link';
import { LogOut, Menu, X, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

type DashboardShellProps = {
  title: string;
  subtitle?: string;
  homeHref: string;
  navItems: DashboardNavItem[];
  pathname: string;
  userName?: string | null;
  userEmail?: string | null;
  userBadge?: string | null;
  onLogout: () => void;
  sidebarOpen: boolean;
  onSidebarOpenChange: (open: boolean) => void;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
};

function isNavActive(pathname: string, item: DashboardNavItem) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export default function DashboardShell({
  title,
  subtitle = 'YAS Togo',
  homeHref,
  navItems,
  pathname,
  userName,
  userEmail,
  userBadge,
  onLogout,
  sidebarOpen,
  onSidebarOpenChange,
  headerExtra,
  children,
}: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-muted/40">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => onSidebarOpenChange(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-background transition-transform lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-border p-5 lg:hidden">
          <span className="font-bold text-yas-midnight">Menu</span>
          <Button variant="ghost" size="icon-sm" onClick={() => onSidebarOpenChange(false)}>
            <X />
          </Button>
        </div>

        <div className="border-b border-border p-5">
          <Link href={homeHref} className="flex items-center gap-3" onClick={() => onSidebarOpenChange(false)}>
            <img src="/jm.svg" alt="YAS" className="h-10 w-auto shrink-0" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-yas-midnight">{title}</p>
              <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onSidebarOpenChange(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon size={18} />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <div className="mb-2 px-2 py-2">
            <p className="truncate text-sm font-semibold text-foreground">{userName}</p>
            <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
            {userBadge && (
              <span className="mt-2 inline-block rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-yas-midnight">
                {userBadge}
              </span>
            )}
          </div>
          {headerExtra}
          <Separator className="my-2" />
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onLogout}
          >
            <LogOut size={18} />
            Déconnexion
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border bg-background px-4 py-3 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => onSidebarOpenChange(true)}>
            <Menu />
          </Button>
          <span className="font-semibold text-yas-midnight">{title}</span>
          <div className="ml-auto">{headerExtra}</div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
