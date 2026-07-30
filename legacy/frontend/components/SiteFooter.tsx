import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export default function SiteFooter() {
  return (
    <footer className="bg-yas-midnight pt-12 pb-8 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <img src="/jm.svg" alt="YAS" className="h-12 w-auto" />
              <div className="flex flex-col">
                <span className="font-bold">YAS Togo</span>
                <span className="text-xs text-white/70">Youth Employment Support</span>
              </div>
            </div>
            <p className="text-sm text-white/75">
              Trouvez votre prochaine opportunité professionnelle chez YAS Togo.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Candidats</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/offres" className="text-sm text-white/65 transition-colors hover:text-white">
                  Nos offres
                </Link>
              </li>
              <li>
                <Link
                  href="/#comment-ca-marche"
                  className="text-sm text-white/65 transition-colors hover:text-white"
                >
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-white/65 transition-colors hover:text-white">
                  Créer un compte
                </Link>
              </li>
              <li>
                <Link href="/profil" className="text-sm text-white/65 transition-colors hover:text-white">
                  Mon profil
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">À propos</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/a-propos" className="text-sm text-white/65 transition-colors hover:text-white">
                  Qui sommes-nous
                </Link>
              </li>
              <li>
                <a href="mailto:rh@yastogo.tg" className="text-sm text-white/65 transition-colors hover:text-white">
                  Nous contacter
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="bg-white/15" />
        <p className="mt-8 text-sm text-white/45">
          © {new Date().getFullYear()} YAS Togo. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
