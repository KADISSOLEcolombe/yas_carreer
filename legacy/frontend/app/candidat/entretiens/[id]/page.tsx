'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Video, User, ExternalLink, Clock, Briefcase, MapPin } from 'lucide-react';
import { api } from '../../../../lib/api';

const COLORS = {
  midnight: '#00377D',
  yellow: '#FFD100',
};

type UiStatus = 'A_VENIR' | 'TERMINE' | 'ANNULE';

const STATUS_STYLES: Record<UiStatus, { bg: string; text: string; label: string }> = {
  A_VENIR: { bg: '#D1FAE5', text: '#065F46', label: 'À venir' },
  TERMINE: { bg: '#E5E7EB', text: '#374151', label: 'Terminé' },
  ANNULE: { bg: '#FEE2E2', text: '#DC2626', label: 'Annulé' },
};

function mapStatut(raw?: string, supprime?: boolean | null): UiStatus {
  if (supprime || raw === 'ANNULE') return 'ANNULE';
  if (raw === 'TERMINE') return 'TERMINE';
  return 'A_VENIR';
}

export default function CandidatEntretienDetailPage() {
  const { id } = useParams();
  const [entretien, setEntretien] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    api
      .getEntretienById(Number(id))
      .then(setEntretien)
      .catch((err) => setError(err.message || 'Impossible de charger cet entretien'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-[#00377D]" />
      </div>
    );
  }

  if (error || !entretien) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link href="/profil" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} /> Retour
        </Link>
        <p className="text-red-600">{error || 'Entretien introuvable'}</p>
      </div>
    );
  }

  const status = mapStatut(entretien.statut, entretien.supprime);
  const style = STATUS_STYLES[status];
  const isVisio = entretien.type === 'visio';
  const dateObj = new Date(entretien.date);
  const dateLabel = dateObj.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const heureLabel = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const rh = entretien.utilisateur_entretien_utilisateurrh_idToutilisateur;
  const offre = entretien.candidature?.offre;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link href="/profil" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} /> Retour à mon espace
        </Link>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-6" style={{ backgroundColor: '#F8FAFC' }}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Entretien</p>
                <h1 className="mt-1 text-2xl font-bold" style={{ color: COLORS.midnight }}>
                  {offre?.titre || 'Entretien YAS'}
                </h1>
              </div>
              <span
                className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                style={{ backgroundColor: style.bg, color: style.text }}
              >
                {style.label}
              </span>
            </div>
          </div>

          <div className="space-y-5 px-6 py-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 text-sm text-gray-700">
                <Calendar size={18} className="mt-0.5 text-gray-400" />
                <div>
                  <p className="font-medium">Date</p>
                  <p className="capitalize">{dateLabel}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-700">
                <Clock size={18} className="mt-0.5 text-gray-400" />
                <div>
                  <p className="font-medium">Heure</p>
                  <p>
                    {heureLabel}
                    {entretien.duree ? ` · ${entretien.duree} min` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-700">
                {isVisio ? (
                  <Video size={18} className="mt-0.5 text-gray-400" />
                ) : (
                  <MapPin size={18} className="mt-0.5 text-gray-400" />
                )}
                <div>
                  <p className="font-medium">Modalité</p>
                  <p>{isVisio ? `Visioconférence${entretien.plateforme ? ` (${entretien.plateforme})` : ''}` : 'Présentiel'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-700">
                <Briefcase size={18} className="mt-0.5 text-gray-400" />
                <div>
                  <p className="font-medium">Poste</p>
                  <p>{offre?.titre || '—'}</p>
                </div>
              </div>
            </div>

            {rh && (
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: COLORS.midnight }}
                  >
                    {(rh.prenom || rh.nom || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Intervieweur RH</p>
                    <p className="font-semibold text-gray-900">
                      {rh.prenom} {rh.nom}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {entretien.commentaire && (
              <div>
                <p className="mb-1 text-sm font-medium text-gray-700">Commentaire</p>
                <p className="text-sm text-gray-600 whitespace-pre-line">{entretien.commentaire}</p>
              </div>
            )}

            {isVisio && entretien.lien_meeting && status === 'A_VENIR' && (
              <a
                href={entretien.lien_meeting}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                <ExternalLink size={16} />
                Rejoindre la visioconférence
              </a>
            )}

            {entretien.candidature?.id && (
              <Link
                href={`/candidat/candidatures/${entretien.candidature.id}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#00377D] hover:underline"
              >
                <User size={16} />
                Voir ma candidature liée
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
