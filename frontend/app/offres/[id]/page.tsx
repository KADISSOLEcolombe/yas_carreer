'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Briefcase,
  ArrowLeft,
  Users,
  LogOut,
  Clock,
  CircleDollarSign,
  Building2,
  Link2,
  Mail,
  Bookmark,
  Play,
  Calendar,
} from 'lucide-react';
import ApplicationModal from '../../../components/ApplicationModal';
import { api, mapOffre, type Job } from '../../../lib/api';
import { useFavoris } from '../../../context/FavorisContext';

const COLORS = {
  yellow: '#facc15',
  midnight: '#1e3a8a',
  text: {
    primary: '#1A1A1A',
    secondary: '#4B5563',
    muted: '#9CA3AF',
  },
  border: '#E5E7EB',
};


function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout, isAuthenticated } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-md flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: COLORS.yellow, color: COLORS.midnight }}
            >
              YT
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight" style={{ color: COLORS.midnight }}>
                YAS Togo
              </span>
              <span className="text-xs leading-tight" style={{ color: COLORS.text.muted }}>
                Nos offres d&apos;emploi
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/offres" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Nos offres
            </Link>
            <Link href="/a-propos" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              À propos
            </Link>
          </nav>

          <div className="hidden sm:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/profil"
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 font-medium transition-colors"
                >
                  <Users size={18} />
                  Mon espace
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  aria-label="Se déconnecter"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 font-medium transition-colors"
                >
                  Se connecter
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2 rounded-md font-medium transition-all hover:opacity-90"
                  style={{ backgroundColor: COLORS.yellow, color: COLORS.midnight }}
                >
                  Créer un compte
                </Link>
              </>
            )}
          </div>

          <button
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
            )}
          </button>
        </div>

        {isMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-gray-200 space-y-2">
            <Link href="/offres" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">
              Nos offres
            </Link>
            <Link href="/a-propos" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">
              À propos
            </Link>
            <div className="pt-2 mt-2 border-t border-gray-200">
              {isAuthenticated ? (
                <>
                  <Link href="/profil" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md mb-2">
                    Mon espace
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md mb-2">
                    Se connecter
                  </Link>
                  <Link
                    href="/register"
                    className="block px-3 py-2 rounded-md text-center font-medium"
                    style={{ backgroundColor: COLORS.yellow, color: COLORS.midnight }}
                  >
                    Créer un compte
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-5">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${COLORS.yellow}33` }}
        >
          <Icon size={20} style={{ color: COLORS.midnight }} aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold" style={{ color: COLORS.midnight }}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

export default function JobDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [job, setJob] = useState<Job | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const { isFavori, toggleFavori } = useFavoris();

  useEffect(() => {
    const loadJob = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const apiOffre = await api.getOffreById(Number(id));
        const mappedJob = mapOffre(apiOffre);
        setJob(mappedJob);
      } catch (err: any) {
        console.error('Erreur lors du chargement de l\'offre:', err);
        if (err.status === 404) {
          setError('Offre introuvable');
        } else {
          setError(err.message || 'Impossible de charger l\'offre');
        }
        setJob(undefined);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadJob();
    }
  }, [id]);

  const similarOffers = useMemo(() => {
    if (!job) return [];
    // Pour l'instant, on ne charge pas les offres similaires depuis l'API
    // Cela nécessiterait un endpoint backend ou un appel à getOffres
    return [];
  }, [job]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // clipboard non disponible
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50">
        <div
          className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2"
          style={{ borderColor: COLORS.midnight }}
          role="status"
          aria-label="Chargement"
        />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error === 'Offre introuvable' ? 'Offre non trouvée' : 'Erreur de chargement'}
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'Impossible de charger les détails de l\'offre.'}
          </p>
          <Link
            href="/offres"
            className="inline-flex items-center gap-2 px-6 py-3 font-bold rounded-lg transition-all hover:opacity-90 shadow-sm"
            style={{ backgroundColor: COLORS.yellow, color: COLORS.midnight }}
          >
            <ArrowLeft size={18} />
            Retour aux offres
          </Link>
        </div>
      </div>
    );
  }

  const exigence = job.description;
  const localisation = job.location;
  const typeContrat = job.type;
  const remuneration = job.salary;

  const registerUrl = `/register?redirect=/offres/${id}&message=auth_required`;

  const renderApplyActions = () => (
    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
      {job.statut !== 'PUBLIEE' ? (
        <span className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold bg-gray-100 text-gray-500">
          Offre clôturée
        </span>
      ) : isAuthenticated ? (
        <button
          onClick={() => setIsApplicationModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold transition-all hover:opacity-90 shadow-sm"
          style={{ backgroundColor: COLORS.yellow, color: COLORS.midnight }}
        >
          Postuler
          <Play size={16} fill="currentColor" aria-hidden="true" />
        </button>
      ) : (
        <Link
          href={registerUrl}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold transition-all hover:opacity-90 shadow-sm"
          style={{ backgroundColor: COLORS.yellow, color: COLORS.midnight }}
        >
          Postuler
          <Play size={16} fill="currentColor" aria-hidden="true" />
        </Link>
      )}
      <button
        onClick={() => toggleFavori(job.id)}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold border-2 transition-colors hover:bg-blue-50"
        style={{ borderColor: COLORS.midnight, color: COLORS.midnight }}
        aria-pressed={isFavori(job.id)}
      >
        <Bookmark size={18} fill={isFavori(job.id) ? COLORS.midnight : 'none'} aria-hidden="true" />
        {isFavori(job.id) ? 'Sauvegardée' : 'Sauvegarder'}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/offres"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Retour aux offres
          </Link>

          {/* En-tête pleine largeur */}
          <header className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1 min-w-0">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                  <Briefcase size={14} aria-hidden="true" />
                  {job.statut === 'PUBLIEE' ? 'RECRUTEMENT EN COURS' : 'OFFRE FERMÉE'}
                </p>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4" style={{ color: COLORS.midnight }}>
                  {job.title}
                </h1>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                  <span className="inline-flex items-center gap-2">
                    <MapPin size={16} className="shrink-0" style={{ color: COLORS.midnight }} aria-hidden="true" />
                    {localisation}, Togo
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock size={16} className="shrink-0" style={{ color: COLORS.midnight }} aria-hidden="true" />
                    {typeContrat}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <CircleDollarSign size={16} className="shrink-0" style={{ color: COLORS.midnight }} aria-hidden="true" />
                    {remuneration}
                  </span>
                  {job.department && (
                    <span className="inline-flex items-center gap-2">
                      <Building2 size={16} className="shrink-0" style={{ color: COLORS.midnight }} aria-hidden="true" />
                      {job.department}
                    </span>
                  )}
                </div>
              </div>
              <div className="shrink-0">{renderApplyActions()}</div>
            </div>
          </header>

          {/* Deux colonnes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne gauche (~2/3) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description / Exigences de l'offre */}
              {exigence && (
                <SectionCard icon={Briefcase} title="Description & Exigences">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{exigence}</p>
                </SectionCard>
              )}

              {/* Date limite */}
              {job.deadline && (
                <SectionCard icon={Calendar} title="Date limite">
                  <p className="text-gray-700">
                    Les candidatures sont ouvertes jusqu'au <strong>{job.deadline}</strong>.
                  </p>
                </SectionCard>
              )}
            </div>

            {/* Colonne droite (~1/3) — sticky */}
            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              {/* Carte entreprise */}


              {/* Partager l'offre */}
              <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-4">
                  Partager l&apos;offre
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  <button
                    onClick={handleCopyLink}
                    className="flex h-11 w-full items-center justify-center rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    aria-label={linkCopied ? 'Lien copié' : 'Copier le lien de l\'offre'}
                    title={linkCopied ? 'Lien copié !' : 'Copier le lien'}
                  >
                    <Link2 size={18} aria-hidden="true" />
                  </button>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-full items-center justify-center rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    aria-label="Partager sur LinkedIn"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 114.126 0 2.063 2.063 0 01-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(job.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-full items-center justify-center rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    aria-label="Partager sur X (Twitter)"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a
                    href={`mailto:?subject=${encodeURIComponent(`Offre : ${job.title}`)}&body=${encodeURIComponent(`Découvrez cette offre : ${shareUrl}`)}`}
                    className="flex h-11 w-full items-center justify-center rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    aria-label="Partager par e-mail"
                  >
                    <Mail size={18} aria-hidden="true" />
                  </a>
                </div>
              </section>

              {/* Offres similaires - désactivé pour l'instant */}
              {/* similarOffers nécessiterait un appel API supplémentaire */}
            </aside>
          </div>
        </div>
      </main>

      {user && (
        <ApplicationModal
          isOpen={isApplicationModalOpen}
          onClose={() => setIsApplicationModalOpen(false)}
          jobId={job.id}
          jobTitle={job.title}
          userId={String(user.id)}
          userNom={user.nom}
          userEmail={user.email}
        />
      )}
    </div>
  );
}
