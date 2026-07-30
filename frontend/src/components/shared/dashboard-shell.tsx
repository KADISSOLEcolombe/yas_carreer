"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/constants";
import { useAuthStore } from "@/lib/auth-store";
import { BrandLogo } from "@/components/shared/brand-logo";
import { NotificationBell } from "@/components/shared/notification-bell";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function DashboardShell({
  navItems,
  children,
}: {
  navItems: DashboardNavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:flex-row">
      <aside className="shrink-0 lg:w-56">
        <div className="rounded-xl bg-yas-midnight p-4 text-white lg:sticky lg:top-24">
          <div className="mb-4 flex items-center justify-between gap-2">
            <BrandLogo
              href="/candidat/dashboard"
              size="sm"
              showWordmark={false}
              className="brightness-110"
            />
            <NotificationBell
              centerHref="/candidat/notifications"
              size="sm"
              className="border-white/20 bg-white/10 text-white shadow-none hover:bg-white/20 hover:text-white"
            />
          </div>
          {user && (
            <div className="mb-4 border-b border-white/10 pb-4">
              <p className="truncate text-sm font-semibold">
                {user.fullName || user.email}
              </p>
              <p className="text-xs text-white/60">{ROLE_LABELS[user.role]}</p>
            </div>
          )}
          <nav className="-mx-1 flex gap-1 overflow-x-auto pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:pb-0">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-yas-yellow text-yas-midnight"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
