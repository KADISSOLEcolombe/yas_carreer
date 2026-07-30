'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Briefcase,
  ArrowLeft,
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
import SiteHeader from '../../../components/SiteHeader';
import { api, mapOffre, type Job } from '../../../lib/api';
import { useFavoris } from '../../../context/FavorisContext';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
    <Card className="p-0 shadow-sm">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 px-6 pt-6 sm:px-8 sm:pt-8">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/20 text-yas-midnight">
          <Icon size={20} aria-hidden="true" />
        </div>
        <CardTitle className="text-xl font-bold text-yas-midnight">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">{children}</CardContent>
    </Card>
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
          className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-yas-midnight"
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
            className={cn(buttonVariants(), 'h-11 gap-2 px-6 font-bold')}
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
        <Button
          onClick={() => setIsApplicationModalOpen(true)}
          className="h-11 px-6 font-bold"
        >
          Postuler
          <Play size={16} fill="currentColor" data-icon="inline-end" aria-hidden="true" />
        </Button>
      ) : (
        <Link
          href={registerUrl}
          className={cn(buttonVariants(), 'h-11 gap-2 px-6 font-bold')}
        >
          Postuler
          <Play size={16} fill="currentColor" aria-hidden="true" />
        </Link>
      )}
      <Button
        variant="outline"
        onClick={() => toggleFavori(job.id)}
        className="h-11 border-2 border-yas-midnight px-6 font-bold text-yas-midnight hover:bg-accent"
        aria-pressed={isFavori(job.id)}
      >
        <Bookmark
          size={18}
          fill={isFavori(job.id) ? 'currentColor' : 'none'}
          data-icon="inline-start"
          aria-hidden="true"
        />
        {isFavori(job.id) ? 'Sauvegardée' : 'Sauvegarder'}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />

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
                <h1 className="mb-4 text-2xl font-bold text-yas-midnight sm:text-3xl lg:text-4xl">
                  {job.title}
                </h1>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                  <span className="inline-flex items-center gap-2">
                    <MapPin size={16} className="shrink-0 text-yas-midnight" aria-hidden="true" />
                    {localisation}, Togo
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock size={16} className="shrink-0 text-yas-midnight" aria-hidden="true" />
                    {typeContrat}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <CircleDollarSign size={16} className="shrink-0 text-yas-midnight" aria-hidden="true" />
                    {remuneration}
                  </span>
                  {job.department && (
                    <span className="inline-flex items-center gap-2">
                      <Building2 size={16} className="shrink-0 text-yas-midnight" aria-hidden="true" />
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
