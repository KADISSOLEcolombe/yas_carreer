"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Menu, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuthStore } from "@/lib/auth-store";
import { ROLE_DASHBOARD_PATH, ROLE_LABELS } from "@/lib/constants";
import { authApi } from "@/lib/api";
import { BrandLogo } from "@/components/shared/brand-logo";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, hydrated } = useAuthStore();
  const [open, setOpen] = useState(false);

  if (
    pathname.startsWith("/rh") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/candidat") ||
    pathname.startsWith("/superviseur") ||
    pathname.startsWith("/a-propos") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")
  ) {
    return null;
  }

  const dashboardPath = user ? ROLE_DASHBOARD_PATH[user.role] : null;

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    logout();
    setOpen(false);
    router.push("/");
  }

  const navLinks = (
    <>
      <Link
        href="/offres"
        className="text-sm font-medium text-foreground/80 transition-colors hover:text-yas-midnight"
        onClick={() => setOpen(false)}
      >
        Nos offres
      </Link>
      <Link
        href="/a-propos"
        className="text-sm font-medium text-foreground/80 transition-colors hover:text-yas-midnight"
        onClick={() => setOpen(false)}
      >
        À propos
      </Link>
      {dashboardPath && (
        <Link
          href={dashboardPath}
          className="text-sm font-medium text-foreground/80 transition-colors hover:text-yas-midnight"
          onClick={() => setOpen(false)}
        >
          Mon espace
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <BrandLogo size="sm" className="min-w-0" priority />

        <nav className="hidden items-center gap-6 md:flex">{navLinks}</nav>

        <div className="hidden items-center gap-2 md:flex">
          {!hydrated ? null : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="max-w-[200px] gap-2">
                  <UserIcon className="size-4 shrink-0" />
                  <span className="truncate">{user.fullName || user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {user.fullName || user.email}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {ROLE_LABELS[user.role]}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {dashboardPath && (
                  <DropdownMenuItem asChild>
                    <Link href={dashboardPath}>Mon espace</Link>
                  </DropdownMenuItem>
                )}
                {user.role === "candidat" && (
                  <DropdownMenuItem asChild>
                    <Link href="/candidat/profil">Mon profil</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/changer-mot-de-passe">Mot de passe</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} variant="destructive">
                  <LogOut className="size-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="outline" asChild className="border-yas-midnight text-yas-midnight hover:bg-yas-midnight/5 hover:text-yas-midnight">
                <Link href="/login">Se connecter</Link>
              </Button>
              <Button asChild className="bg-yas-yellow text-yas-midnight hover:bg-yas-yellow/90 font-semibold border-none">
                <Link href="/register">Créer un compte</Link>
              </Button>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0 md:hidden">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[min(100%,20rem)]">
            <SheetHeader>
              <SheetTitle className="text-left">
                <BrandLogo href={null} size="sm" />
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 px-4 pb-6">
              {navLinks}
              <div className="my-2 h-px bg-border" />
              {user ? (
                <>
                  <span className="truncate text-sm text-muted-foreground">
                    Connecté en tant que {user.fullName || user.email}
                  </span>
                  <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="size-4" />
                    Déconnexion
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    asChild
                    onClick={() => setOpen(false)}
                    className="border-yas-midnight text-yas-midnight hover:bg-yas-midnight/5 hover:text-yas-midnight"
                  >
                    <Link href="/login">Se connecter</Link>
                  </Button>
                  <Button
                    asChild
                    onClick={() => setOpen(false)}
                    className="bg-yas-yellow text-yas-midnight hover:bg-yas-yellow/90 font-semibold border-none"
                  >
                    <Link href="/register">Créer un compte</Link>
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
