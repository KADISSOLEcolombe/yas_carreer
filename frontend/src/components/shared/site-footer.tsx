import Link from "next/link";
import { BrandLogo } from "@/components/shared/brand-logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <BrandLogo href="/" size="sm" showWordmark={false} />
          <div>
            <p className="font-heading text-sm font-bold text-yas-midnight">
              YasCareer
            </p>
            <p className="text-xs text-slate-500">
              Plateforme de recrutement Yas Togo
            </p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
          <Link href="/offres" className="hover:text-yas-midnight">
            Offres
          </Link>
          <Link href="/login" className="hover:text-yas-midnight">
            Connexion
          </Link>
          <a
            href="https://yas.tg"
            target="_blank"
            rel="noreferrer"
            className="hover:text-yas-midnight"
          >
            yas.tg
          </a>
        </nav>
      </div>
    </footer>
  );
}
