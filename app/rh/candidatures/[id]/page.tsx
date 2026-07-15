'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Briefcase, Calendar, MapPin, Phone, Mail, FileText, Download, Check, X } from 'lucide-react';
import { api, mapCandidature, mapStatusToBackend, type Application } from '../../../../lib/api';

const COLORS = {
  midnight: '#1e3a8a',
  yellow: '#facc15',
};

const STATUS_STYLES: Record<Application['status'], { bg: string; text: string; label: string }> = {
  PENDING: { bg: '#FEF3C7', text: '#92400E', label: 'En attente' },
  IN_REVIEW: { bg: '#DBEAFE', text: '#1E40AF', label: 'En examen' },
  INTERVIEW: { bg: '#EDE9FE', text: '#6D28D9', label: 'Entretien' },
  ACCEPTED: { bg: '#D1FAE5', text: '#065F46', label: 'Accepté' },
  REJECTED: { bg: '#FEE2E2', text: '#DC2626', label: 'Refusé' },
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

export default function RHCandidatureDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
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

  const handleAccept = async () => {
    if (!application) return;
    try {
      await api.updateApplicationStatus(Number(application.id), mapStatusToBackend('ACCEPTED'));
      // Recharger la candidature
      const apiCandidature = await api.getApplicationById(Number(application.id));
      const mappedApplication = mapCandidature(apiCandidature);
      setApplication(mappedApplication);
    } catch (err: any) {
      console.error('Erreur lors de l\'acceptation:', err);
      alert(err.message || 'Erreur lors de l\'acceptation');
    }
  };

  const handleReject = async () => {
    if (!application) return;
    try {
      await api.updateApplicationStatus(Number(application.id), mapStatusToBackend('REJECTED'));
      // Recharger la candidature
      const apiCandidature = await api.getApplicationById(Number(application.id));
      const mappedApplication = mapCandidature(apiCandidature);
      setApplication(mappedApplication);
    } catch (err: any) {
      console.error('Erreur lors du rejet:', err);
      alert(err.message || 'Erreur lors du rejet');
    }
  };

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
            href="/rh/candidatures"
            className="inline-flex items-center gap-2 px-6 py-3 font-bold rounded-lg transition-all hover:opacity-90 shadow-sm"
            style={{ backgroundColor: COLORS.yellow, color: COLORS.midnight }}
          >
            <ArrowLeft size={18} />
            Retour aux candidatures
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
          href="/rh/candidatures"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Retour aux candidatures
        </Link>

        {/* En-tête */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white"
              style={{ backgroundColor: COLORS.midnight }}
            >
              {application.nom.charAt(0).toUpperCase()}
            </div>

            {/* Informations */}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: COLORS.midnight }}>
                {application.nom}
              </h1>
              <p className="text-gray-600 mb-4">{application.jobTitle}</p>
              <StatusBadge status={application.status} />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleAccept}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: COLORS.midnight }}
              >
                <Check size={18} />
                Accepter
              </button>
              <button
                onClick={handleReject}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-red-600 border border-red-200 bg-red-50 transition-opacity hover:opacity-90"
              >
                <X size={18} />
                Refuser
              </button>
            </div>
          </div>
        </div>

        {/* Informations personnelles */}
        <SectionCard icon={User} title="Informations personnelles">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Nom</p>
              <p className="font-semibold text-gray-900">{application.nom}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500 mb-1">E-mail</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  {application.email}
                </p>
              </div>
              {application.telephone && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Téléphone</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" />
                    {application.telephone}
                  </p>
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* Parcours - non disponible en base pour l'instant */}
        {/* Documents - non disponibles en base pour l'instant */}

        {/* Informations candidature */}
        <SectionCard icon={Calendar} title="Informations de la candidature">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Date de candidature</p>
              <p className="font-semibold text-gray-900">{new Date(application.createdAt).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </SectionCard>
      </main>
    </div>
  );
}
