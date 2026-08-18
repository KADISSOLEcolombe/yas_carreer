"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Mail } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/40">
        {title}
      </p>
      <nav className="mt-4 flex flex-col gap-2.5">{children}</nav>
    </div>
  );
}

function FooterLink({
  href,
  external,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  const className =
    "inline-flex items-center gap-1.5 text-sm text-white/70 transition hover:text-white";
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {children}
        <ExternalLink className="size-3.5 shrink-0 opacity-60" />
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function SiteFooter() {
  const pathname = usePathname();

  // Espaces applicatifs internes (RH, admin, candidat, superviseur) : chrome
  // propre via WorkspaceShell, un footer marketing n'y a pas sa place.
  if (
    pathname.startsWith("/rh") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/candidat") ||
    pathname.startsWith("/superviseur")
  ) {
    return null;
  }

  return (
    <footer className="bg-yas-midnight text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <BrandLogo href="/" size="md" variant="light" />
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              La plateforme de recrutement Yas Togo. Trouvez votre prochaine
              opportunité professionnelle ou constituez les équipes de demain.
            </p>
          </div>

          <FooterColumn title="Candidats">
            <FooterLink href="/offres">Voir les offres</FooterLink>
            <FooterLink href="/register">Créer un compte</FooterLink>
            <FooterLink href="/login">Se connecter</FooterLink>
          </FooterColumn>

          <FooterColumn title="Entreprise">
            <FooterLink href="/a-propos">À propos de Yas Togo</FooterLink>
            <FooterLink href="https://yas.tg" external>
              Site institutionnel
            </FooterLink>
            <FooterLink href="/login">Espace RH</FooterLink>
          </FooterColumn>

          <FooterColumn title="Contact">
            <a
              href="mailto:rh@yascareer.tg"
              className="inline-flex items-center gap-1.5 text-sm text-white/70 transition hover:text-white"
            >
              <Mail className="size-3.5 shrink-0 opacity-60" />
              rh@yascareer.tg
            </a>
            <a
              href="mailto:admin@yascareer.tg"
              className="inline-flex items-center gap-1.5 text-sm text-white/70 transition hover:text-white"
            >
              <Mail className="size-3.5 shrink-0 opacity-60" />
              admin@yascareer.tg
            </a>
          </FooterColumn>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Yas Togo — YasCareer. Tous droits
            réservés.
          </p>
          <nav className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-white/40">
            <Link href="/" className="hover:text-white/70">
              Accueil
            </Link>
            <Link href="/offres" className="hover:text-white/70">
              Offres
            </Link>
            <Link href="/a-propos" className="hover:text-white/70">
              À propos
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
