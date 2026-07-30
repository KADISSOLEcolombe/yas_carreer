'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/offres', label: 'Nos offres' },
  { href: '/#comment-ca-marche', label: 'Comment ça marche' },
  { href: '/a-propos', label: 'À propos' },
] as const;

function isActive(pathname: string, href: string) {
  if (href.startsWith('/#')) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

type SiteHeaderProps = {
  transparentOnTop?: boolean;
};

export default function SiteHeader({ transparentOnTop = false }: SiteHeaderProps) {
  const { logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!transparentOnTop) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [transparentOnTop]);

  const floating = transparentOnTop && !scrolled;

  return (
    <header
      className={cn(
        'fixed top-0 right-0 left-0 z-50 transition-all duration-300',
        floating
          ? 'border-transparent bg-transparent'
          : 'border-b border-border/80 bg-background/90 backdrop-blur-md'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <img src="/jm.svg" alt="YAS" className="h-11 w-auto drop-shadow-sm sm:h-12" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                floating
                  ? 'text-white/85 hover:bg-white/10 hover:text-white'
                  : isActive(pathname, link.href)
                    ? 'bg-accent text-yas-midnight'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          {isAuthenticated ? (
            <>
              <Link
                href="/profil"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'h-9 gap-2 px-4',
                  floating &&
                    'border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white'
                )}
              >
                <Users className="size-4" />
                Mon espace
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                aria-label="Se déconnecter"
                className={floating ? 'text-white hover:bg-white/10 hover:text-white' : undefined}
              >
                <LogOut />
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'h-9 px-4',
                  floating &&
                    'border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white'
                )}
              >
                Se connecter
              </Link>
              <Link
                href="/register"
                className={cn(buttonVariants({ size: 'lg' }), 'h-9 px-4 font-semibold')}
              >
                Créer un compte
              </Link>
            </>
          )}
        </div>

        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'lg:hidden',
                  floating && 'text-white hover:bg-white/10 hover:text-white'
                )}
                aria-label="Ouvrir le menu"
              />
            }
          >
            <Menu />
          </SheetTrigger>
          <SheetContent side="right" className="w-[min(100%,20rem)]">
            <SheetHeader>
              <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
              <img src="/jm.svg" alt="YAS" className="h-10 w-auto" />
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {NAV_LINKS.map((link) => (
                <SheetClose
                  key={link.href}
                  render={
                    <Link
                      href={link.href}
                      className={cn(
                        'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive(pathname, link.href)
                          ? 'bg-accent text-yas-midnight'
                          : 'text-foreground hover:bg-muted'
                      )}
                    />
                  }
                >
                  {link.label}
                </SheetClose>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-2 border-t border-border p-4">
              {isAuthenticated ? (
                <>
                  <SheetClose
                    render={
                      <Link
                        href="/profil"
                        className={cn(
                          buttonVariants({ variant: 'outline' }),
                          'w-full justify-start gap-2'
                        )}
                      />
                    }
                  >
                    <Users className="size-4" />
                    Mon espace
                  </SheetClose>
                  <Button variant="ghost" className="w-full justify-start gap-2" onClick={logout}>
                    <LogOut className="size-4" />
                    Déconnexion
                  </Button>
                </>
              ) : (
                <>
                  <SheetClose
                    render={
                      <Link
                        href="/login"
                        className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
                      />
                    }
                  >
                    Se connecter
                  </SheetClose>
                  <SheetClose
                    render={
                      <Link
                        href="/register"
                        className={cn(buttonVariants(), 'w-full font-semibold')}
                      />
                    }
                  >
                    Créer un compte
                  </SheetClose>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
