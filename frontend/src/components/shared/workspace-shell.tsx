"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ChevronDown,
  HelpCircle,
  LogOut,
  Search,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";
import { ROLE_LABELS } from "@/lib/constants";
import { authApi } from "@/lib/api";
import { BrandLogo } from "@/components/shared/brand-logo";
import { NotificationBell } from "@/components/shared/notification-bell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type WorkspaceNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

function initials(name?: string | null, email?: string) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "YA";
  }
  return (email?.slice(0, 2) || "YA").toUpperCase();
}

function greeting(firstName: string) {
  const h = new Date().getHours();
  const salutation =
    h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir";
  return `${salutation}, ${firstName}`;
}

export function WorkspaceShell({
  children,
  mainNav,
  otherNav = [],
  homeHref,
  workspaceLabel,
  primaryCta,
}: {
  children: React.ReactNode;
  mainNav: WorkspaceNavItem[];
  otherNav?: WorkspaceNavItem[];
  homeHref: string;
  workspaceLabel: string;
  primaryCta?: { href: string; label: string; icon: LucideIcon };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [query, setQuery] = useState("");

  const firstName = useMemo(() => {
    const n = user?.fullName?.trim();
    if (!n) return "Yas";
    return n.split(/\s+/)[0];
  }, [user?.fullName]);

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    []
  );

  const notificationsHref = homeHref.startsWith("/admin")
    ? "/admin/notifications"
    : homeHref.startsWith("/rh")
      ? "/rh/notifications"
      : "/notifications";

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    logout();
    router.push("/login");
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  function NavLink({ item }: { item: WorkspaceNavItem }) {
    const active = isActive(item.href);
    const Icon = item.icon;
    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
          active
            ? "bg-yas-midnight text-white shadow-sm shadow-yas-midnight/20"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        )}
      >
        <Icon className="size-[18px]" strokeWidth={active ? 2.25 : 1.75} />
        {item.label}
      </Link>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-800">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        {/* Sidebar Soft UI */}
        <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col border-r border-slate-200/80 bg-white px-4 py-5 lg:flex">
          <div className="mb-5 px-1">
            <BrandLogo href={homeHref} size="md" />
            <p className="mt-1 truncate pl-[3.25rem] text-[11px] text-slate-400">
              {workspaceLabel} · Lomé, Togo
            </p>
          </div>

          <div className="relative mb-5">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-yas-sky focus:bg-white focus:ring-2 focus:ring-yas-sky/20"
            />
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
              ⌘K
            </kbd>
          </div>

          {primaryCta && (
            <Link
              href={primaryCta.href}
              className="mb-5 flex items-center justify-center gap-2 rounded-xl bg-yas-midnight px-3 py-2.5 text-sm font-semibold text-white shadow-md shadow-yas-midnight/25 transition hover:bg-yas-midnight/90"
            >
              <primaryCta.icon className="size-4" />
              {primaryCta.label}
            </Link>
          )}

          <div className="flex-1 space-y-5 overflow-y-auto">
            <div>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Principal
              </p>
              <nav className="space-y-1">
                {mainNav.map((item) => (
                  <NavLink key={item.href} item={item} />
                ))}
              </nav>
            </div>

            {(otherNav.length > 0 || true) && (
              <div>
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Autres
                </p>
                <nav className="space-y-1">
                  {otherNav.map((item) => (
                    <NavLink key={item.href} item={item} />
                  ))}
                  <Link
                    href="/"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                  >
                    <Settings className="size-[18px]" strokeWidth={1.75} />
                    Site public
                  </Link>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                    onClick={() =>
                      toast.message("Support YasCareer", {
                        description: "rh@yascareer.tg · admin@yascareer.tg",
                      })
                    }
                  >
                    <HelpCircle className="size-[18px]" strokeWidth={1.75} />
                    Support
                  </button>
                </nav>
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-2.5 py-2.5 text-left transition hover:bg-slate-50"
              >
                <Avatar className="size-9 bg-yas-midnight">
                  <AvatarFallback className="bg-yas-midnight text-xs text-white">
                    {initials(user?.fullName, user?.email)}
                  </AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-800">
                    {user?.fullName || "Utilisateur"}
                  </span>
                  <span className="block truncate text-[11px] text-slate-400">
                    {user ? ROLE_LABELS[user.role] : workspaceLabel}
                  </span>
                </span>
                <ChevronDown className="size-4 shrink-0 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel className="truncate">
                {user?.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/changer-mot-de-passe">
                  <Settings className="size-4" />
                  Mot de passe
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} variant="destructive">
                <LogOut className="size-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </aside>

        {/* Mobile bottom nav */}
        <div className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white/95 px-1 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
          {mainNav.slice(0, 5).map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-0.5 py-1.5 text-[10px] font-medium",
                  active ? "text-yas-midnight" : "text-slate-400"
                )}
              >
                <Icon className="size-5 shrink-0" />
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
          <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-[#F5F7FA]/90 backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-4 py-3 lg:hidden">
              <BrandLogo href={homeHref} size="sm" />
              <NotificationBell centerHref={notificationsHref} size="sm" />
            </div>
            <div className="flex items-start justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
              <div className="min-w-0">
                <h1 className="font-heading text-lg font-bold tracking-tight text-yas-midnight sm:text-2xl">
                  {greeting(firstName)}
                </h1>
                <p className="mt-0.5 text-sm text-slate-500 line-clamp-2 sm:line-clamp-none">
                  Voici l&apos;état du recrutement Yas Togo aujourd&apos;hui.
                </p>
              </div>
              <div className="hidden shrink-0 items-center gap-2 lg:flex">
                <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm">
                  {todayLabel}
                </div>
                <NotificationBell centerHref={notificationsHref} />
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
