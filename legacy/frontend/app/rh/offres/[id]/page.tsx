'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Briefcase, MapPin, Calendar, Users, FileText, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { api, mapOffre, type ApiOffre, type Job } from '../../../../lib/api';

const COLORS = {
  midnight: '#00377D',
  yellow: '#FFD100',
};

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

function RequirementBadge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700">
      {text}
    </span>
  );
}

export default function RHOffreDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [offre, setOffre] = useState<ApiOffre | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOffre = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const apiOffre = await api.getOffreById(Number(id));
        setOffre(apiOffre);
        const mappedJob = mapOffre(apiOffre);
        setJob(mappedJob);
      } catch (err: any) {
        console.error('Erreur lors du chargement de l\'offre:', err);
        if (err.status === 404) {
          setError('Offre introuvable');
        } else {
          setError(err.message || 'Impossible de charger l\'offre');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadOffre();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!offre) return;
    const newStatus = offre.statut === 'PUBLIEE' ? 'FERMEE' : 'PUBLIEE';
    try {
      await api.updateOffreStatus(offre.id, newStatus);
      // Recharger l'offre
      const apiOffre = await api.getOffreById(offre.id);
      setOffre(apiOffre);
      const mappedJob = mapOffre(apiOffre);
      setJob(mappedJob);
    } catch (err: any) {
      console.error('Erreur lors du changement de statut:', err);
      alert(err.message || 'Erreur lors du changement de statut');
    }
  };

  const handleDelete = async () => {
    if (!offre) return;
    if (confirm('Supprimer cette offre ?')) {
      try {
        await api.deleteOffre(offre.id);
        router.push('/rh/offres');
      } catch (err: any) {
        console.error('Erreur lors de la suppression:', err);
        alert(err.message || 'Erreur lors de la suppression');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: COLORS.midnight }} />
      </div>
    );
  }

  if (error || !offre || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error === 'Offre introuvable' ? 'Offre non trouvée' : 'Erreur de chargement'}
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'Impossible de charger les détails de l\'offre.'}
          </p>
          <Link
            href="/rh/offres"
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

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Lien retour */}
        <Link
          href="/rh/offres"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Retour aux offres
        </Link>

        {/* En-tête */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Icône */}
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `${COLORS.yellow}33` }}
            >
              <Briefcase size={32} style={{ color: COLORS.midnight }} />
            </div>

            {/* Informations */}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: COLORS.midnight }}>
                {job.title}
              </h1>
              <p className="text-gray-600 mb-4">{job.company}</p>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                    offre.statut === 'PUBLIEE'
                      ? 'bg-green-50 text-green-700'
                      : offre.statut === 'BROUILLON'
                      ? 'bg-yellow-50 text-yellow-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {offre.statut === 'PUBLIEE' ? 'Publiée' : offre.statut === 'BROUILLON' ? 'Brouillon' : 'Fermée'}
                </span>
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                  {job.type}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleToggleStatus}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-700 border border-gray-200 bg-white transition-opacity hover:opacity-90"
                title={offre.statut === 'PUBLIEE' ? 'Fermer' : 'Publier'}
              >
                {offre.statut === 'PUBLIEE' ? <EyeOff size={18} /> : <Eye size={18} />}
                {offre.statut === 'PUBLIEE' ? 'Fermer' : 'Publier'}
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-red-600 border border-red-200 bg-red-50 transition-opacity hover:opacity-90"
              >
                <Trash2 size={18} />
                Supprimer
              </button>
            </div>
          </div>
        </div>

        {/* Informations de l'offre */}
        <SectionCard icon={Briefcase} title="Informations de l'offre">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500 mb-1">Lieu</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  {job.location}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Département</p>
                <p className="font-semibold text-gray-900">{job.department}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500 mb-1">Type de contrat</p>
                <p className="font-semibold text-gray-900">{job.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Date limite</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  {job.deadline}
                </p>
              </div>
            </div>

            {job.createdAt && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Date de publication</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  {job.postedDate}
                </p>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Description */}
        <SectionCard icon={FileText} title="Description">
          <p className="text-gray-700 leading-relaxed">{job.description}</p>
        </SectionCard>

        {/* Prérequis - non disponible en base pour l'instant */}
        {/* Responsabilités - non disponibles en base pour l'instant */}
      </main>
    </div>
  );
}
