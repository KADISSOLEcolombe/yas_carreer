'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Briefcase, Calendar, FileText, Clock, MapPin, Building2, XCircle } from 'lucide-react';
import { api, mapCandidature, type Application, type HistoriqueStatutEntry } from '../../../../lib/api';

const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  ACCEPTEE: 'Acceptée',
  REJETEE: 'Refusée',
};

const COLORS = {
  midnight: '#1e3a8a',
  yellow: '#facc15',
};

const STATUS_STYLES: Record<Application['status'], { bg: string; text: string; label: string }> = {
  PENDING: { bg: '#FEF3C7', text: '#92400E', label: 'En attente' },
  IN_REVIEW: { bg: '#DBEAFE', text: '#1E40AF', label: 'En examen' },
  INTERVIEW: { bg: '#EDE9FE', text: '#6D28D9', label: 'Entretien' },
  ACCEPTED: { bg: '#D1FAE5', text: '#065F46', label: 'Acceptée' },
  REJECTED: { bg: '#FEE2E2', text: '#DC2626', label: 'Refusée' },
};

function StatusBadge({ status }: { status: Application['status'] }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {style.label}
    </span>
  );
}

function ProgressionFrise({ status }: { status: Application['status'] }) {
  const etapes = [
    { label: 'POSTULÉ', key: 'postule' },
    { label: 'EN RÉVISION', key: 'revision' },
    { label: 'ENTRETIEN', key: 'entretien' },
    { label: 'OFFRE', key: 'offre' },
  ];

  let etapeCourante = 0;
  if (status === 'PENDING') etapeCourante = 1;
  else if (status === 'IN_REVIEW') etapeCourante = 2;
  else if (status === 'INTERVIEW') etapeCourante = 3;
  else if (status === 'ACCEPTED') etapeCourante = 4;
  else if (status === 'REJECTED') etapeCourante = -1;

  const estRefusee = status === 'REJECTED';

  return (
    <div className="w-full">
      {estRefusee ? (
        <div className="flex items-center gap-2">
          <div className="h-1 flex-1 rounded-full bg-gray-200" />
          <span className="text-xs font-semibold text-red-600">REFUSÉE</span>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-0">
          {etapes.map((etape, index) => {
            const estPasse = index < etapeCourante;
            const estCourant = index === etapeCourante;

            return (
              <div key={etape.key} className="flex flex-col items-center">
                <div className="relative flex w-full items-center justify-center">
                  {index > 0 && (
                    <div
                      className={`absolute left-0 right-1/2 h-0.5 ${
                        estPasse ? 'bg-yellow-400' : 'bg-gray-200'
                      }`}
                      aria-hidden="true"
                    />
                  )}
                  {index < etapes.length - 1 && (
                    <div
                      className={`absolute left-1/2 right-0 h-0.5 ${
                        estPasse || estCourant ? 'bg-yellow-400' : 'bg-gray-200'
                      }`}
                      aria-hidden="true"
                    />
                  )}
                  <div
                    className={`relative z-10 flex h-3 w-3 shrink-0 items-center justify-center rounded-full ${
                      estPasse
                        ? 'bg-yellow-400'
                        : estCourant
                        ? 'bg-yellow-400 ring-4 ring-yellow-100'
                        : 'bg-gray-300'
                    }`}
                    aria-label={`Étape ${index + 1} : ${etape.label}`}
                  >
                    {estCourant && (
                      <div className="h-1.5 w-1.5 rounded-full bg-yellow-600" />
                    )}
                  </div>
                </div>
                <span
                  className={`mt-2 text-[10px] font-medium uppercase ${
                    estPasse || estCourant ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {etape.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
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
    <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${COLORS.yellow}33` }}
        >
          <Icon size={20} style={{ color: COLORS.midnight }} aria-hidden="true" />
        </div>
        <h2 className="text-lg font-bold" style={{ color: COLORS.midnight }}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

export default function CandidatureDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [historique, setHistorique] = useState<HistoriqueStatutEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadApplication = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);
      try {
        const apiCandidature = await api.getApplicationById(Number(id));
        const mappedApplication = mapCandidature(apiCandidature);
        setApplication(mappedApplication);
        try {
          setHistorique(await api.getApplicationHistorique(Number(id)));
        } catch (histErr) {
          console.error('Erreur lors du chargement de l\'historique:', histErr);
        }
      } catch (err: any) {
        console.error('Erreur lors du chargement de la candidature:', err);
        if (err.status === 404) {
          setError('Candidature introuvable');
        } else {
          setError(err.message || 'Impossible de charger la candidature');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadApplication();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: COLORS.midnight }} />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error === 'Candidature introuvable' ? 'Candidature non trouvée' : 'Erreur de chargement'}
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'Impossible de charger les détails de la candidature.'}
          </p>
          <Link
            href="/candidat/candidatures"
            className="inline-flex items-center gap-2 px-6 py-3 font-bold rounded-lg transition-all hover:opacity-90 shadow-sm"
            style={{ backgroundColor: COLORS.yellow, color: COLORS.midnight }}
          >
            <ArrowLeft size={18} />
            Retour à mes candidatures
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Lien retour */}
        <Link
          href="/candidat/candidatures"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Retour à mes candidatures
        </Link>

        {/* En-tête */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4" style={{ color: COLORS.midnight }}>
            {application.jobTitle}
          </h1>
          
          {/* Ligne d'infos */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mb-4">
            <span className="inline-flex items-center gap-2">
              <Calendar size={16} className="shrink-0" style={{ color: COLORS.midnight }} aria-hidden="true" />
              Candidature le {new Date(application.createdAt).toLocaleDateString('fr-FR')}
            </span>
          </div>

          {/* Badge de statut */}
          <div className="mb-6">
            <StatusBadge status={application.status} />
          </div>

          {/* Frise de progression */}
          <ProgressionFrise status={application.status} />
        </div>

        {/* Description du poste - non disponible en base pour l'instant */}
        {/* Mes documents - non disponibles en base pour l'instant */}
        <SectionCard icon={FileText} title="Informations">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-900">Nom :</span>
              <span className="text-sm text-gray-600">{application.nom}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-900">Email :</span>
              <span className="text-sm text-gray-600">{application.email}</span>
            </div>
            {application.telephone && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-900">Téléphone :</span>
                <span className="text-sm text-gray-600">{application.telephone}</span>
              </div>
            )}
          </div>
        </SectionCard>

        {historique.length > 0 && (
          <div className="mt-6">
            <SectionCard icon={Clock} title="Historique des changements">
              <ol className="space-y-4">
                {historique.map((entry) => (
                  <li key={entry.id} className="flex items-start gap-3">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: COLORS.yellow }} aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {entry.ancien_statut
                          ? `${STATUT_LABELS[entry.ancien_statut] ?? entry.ancien_statut} → ${STATUT_LABELS[entry.nouveau_statut] ?? entry.nouveau_statut}`
                          : `Candidature créée (${STATUT_LABELS[entry.nouveau_statut] ?? entry.nouveau_statut})`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(entry.date_changement).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </SectionCard>
          </div>
        )}
      </main>
    </div>
  );
}
