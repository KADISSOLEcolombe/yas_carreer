"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  ChevronDown,
  FileCheck,
  HelpCircle,
  LayoutDashboard,
  Briefcase,
  LogOut,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";
import { ROLE_LABELS } from "@/lib/constants";
import { authApi } from "@/lib/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface RhNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const DEFAULT_NAV: RhNavItem[] = [
  { href: "/rh/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/rh/candidatures", label: "Candidatures", icon: FileCheck },
  { href: "/rh/offres", label: "Offres", icon: Briefcase },
  { href: "/rh/entretiens", label: "Entretiens", icon: CalendarClock },
];

function initials(name?: string | null, email?: string) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "YA";
  }
  return (email?.slice(0, 2) || "YA").toUpperCase();
}

export function RhAppShell({
  children,
  navItems = DEFAULT_NAV,
}: {
  children: React.ReactNode;
  navItems?: RhNavItem[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    logout();
    router.push("/login");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f6fa]">
      {/* Soft ambient gradient like pro SaaS HR */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 60% 40% at 10% 0%, rgba(255,209,0,0.18), transparent 55%),
            radial-gradient(ellipse 50% 35% at 90% 10%, rgba(95,153,210,0.22), transparent 50%),
            radial-gradient(ellipse 40% 30% at 70% 100%, rgba(0,55,125,0.08), transparent 50%)
          `,
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1440px] gap-0 p-3 sm:p-4 lg:gap-4 lg:p-5">
        {/* Sidebar */}
        <aside className="hidden w-[240px] shrink-0 flex-col rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur-md lg:flex">
          <Link href="/rh/dashboard" className="mb-8 flex items-center gap-2.5 px-1">
            <span className="flex size-9 items-center justify-center rounded-xl bg-yas-yellow font-heading text-sm font-bold text-yas-midnight shadow-sm">
              Yas
            </span>
            <div className="leading-tight">
              <p className="font-heading text-base font-bold text-yas-midnight">
                YasCareer
              </p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Espace RH
              </p>
            </div>
          </Link>

          <nav className="flex flex-1 flex-col gap-1">
            {navItems.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-yas-midnight/8 text-yas-midnight"
                      : "text-muted-foreground hover:bg-black/[0.03] hover:text-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-[18px]",
                      active ? "text-yas-midnight" : "text-muted-foreground"
                    )}
                    strokeWidth={active ? 2.25 : 1.75}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-1 border-t border-border/60 pt-4">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-black/[0.03] hover:text-foreground"
            >
              <Settings className="size-[18px]" strokeWidth={1.75} />
              Site public
            </Link>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-black/[0.03] hover:text-foreground"
              onClick={() =>
                toast.message("Support YasCareer", {
                  description: "Contactez rh@yascareer.tg",
                })
              }
            >
              <HelpCircle className="size-[18px]" strokeWidth={1.75} />
              Support
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="mt-2 flex w-full items-center gap-3 rounded-xl border border-border/70 bg-white px-2.5 py-2 text-left transition hover:bg-secondary/50"
                >
                  <Avatar size="sm" className="bg-yas-midnight text-white">
                    <AvatarFallback className="bg-yas-midnight text-[10px] text-white">
                      {initials(user?.fullName, user?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {user?.fullName || "RH Yas"}
                    </span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {user?.email}
                    </span>
                  </span>
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>
                  {user ? ROLE_LABELS[user.role] : "RH"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} variant="destructive">
                  <LogOut className="size-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* Mobile top nav */}
        <div className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium",
                  active ? "text-yas-midnight" : "text-muted-foreground"
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Main panel */}
        <main className="flex min-h-[calc(100vh-2.5rem)] min-w-0 flex-1 flex-col rounded-2xl border border-white/70 bg-white shadow-sm pb-20 lg:pb-0">
          <div className="flex-1 p-5 sm:p-7 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
