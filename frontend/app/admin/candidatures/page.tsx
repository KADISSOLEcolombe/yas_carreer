'use client';

import { useEffect, useState } from 'react';
import { CircleCheck, CircleX, Search, Clock } from 'lucide-react';
import AdminDashboardHeader from '../../../components/admin/AdminDashboardHeader';
import { api, type ApiCandidature } from '../../../lib/api';

const COLORS = {
  midnight: '#1e3a8a',
};

const TYPE_BADGE: Record<string, { bg: string; text: string }> = {
  CDI: { bg: COLORS.midnight, text: '#FFFFFF' },
  CDD: { bg: '#F6A800', text: '#FFFFFF' },
  Stage: { bg: '#5F99D2', text: '#FFFFFF' },
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  EN_ATTENTE: { bg: '#FEF3C7', text: '#92400E', label: 'En attente' },
  EN_EXAMEN: { bg: '#DBEAFE', text: '#1E40AF', label: 'En examen' },
  ENTRETIEN: { bg: '#EDE9FE', text: '#6D28D9', label: 'Entretien' },
  ACCEPTEE: { bg: '#D1FAE5', text: '#065F46', label: 'Acceptée' },
  REJETEE: { bg: '#FEE2E2', text: '#DC2626', label: 'Refusée' },
};

function TypeBadge({ type }: { type: string }) {
  const style = TYPE_BADGE[type] || { bg: '#94A3B8', text: '#FFFFFF' };
  return (
    <span className="inline-flex rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: style.bg, color: style.text }}>
      {type}
    </span>
  );
}

function StatusBadge({ statut }: { statut: string }) {
  const style = STATUS_STYLES[statut] || { bg: '#E2E8F0', text: '#4B5563', label: statut };
  return (
    <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: style.bg, color: style.text }}>
      {style.label}
    </span>
  );
}

function ScoreBadge({ score }: { score?: number | null }) {
  if (score === null || score === undefined) return null;
  const style = score >= 70 ? { bg: '#D1FAE5', text: '#065F46' } : score >= 40 ? { bg: '#FEF3C7', text: '#92400E' } : { bg: '#FEE2E2', text: '#DC2626' };
  return (
    <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: style.bg, color: style.text }}>
      {score}% compatible
    </span>
  );
}

export default function AdminCandidaturesPage() {
  const [candidatures, setCandidatures] = useState<ApiCandidature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCandidatures = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getAllApplications();
      setCandidatures(data);
    } catch (err: any) {
      console.error('Erreur lors du chargement des candidatures:', err);
      setError(err.message || 'Impossible de charger les candidatures');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCandidatures();
  }, []);

  const handleUpdateStatus = async (id: number, statut: 'EN_ATTENTE' | 'EN_EXAMEN' | 'ACCEPTEE' | 'REJETEE') => {
    try {
      await api.updateApplicationStatus(id, statut);
      await loadCandidatures();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la mise à jour du statut');
    }
  };

  return (
    <div className="space-y-6">
      <AdminDashboardHeader />

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <h2 className="text-lg font-bold text-gray-900">Toutes les candidatures ({candidatures.length})</h2>
        </div>

        <div className="px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-400" />
            </div>
          ) : error ? (
            <p className="text-center text-red-600 py-12">{error}</p>
          ) : candidatures.length === 0 ? (
            <p className="text-center text-gray-500 py-12">Aucune candidature</p>
          ) : (
            candidatures.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-4 border-b border-gray-100 py-4 last:border-b-0">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: COLORS.midnight }}
                  >
                    {(c.utilisateur?.nom || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-gray-900">
                      {c.utilisateur?.prenom} {c.utilisateur?.nom}
                    </p>
                    <p className="truncate text-sm text-gray-500">
                      {c.offre?.titre} · {new Date(c.date_soumission).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <TypeBadge type={c.offre?.type || ''} />
                  <ScoreBadge score={c.score} />
                  <StatusBadge statut={c.statut} />
                  <button
                    onClick={() => handleUpdateStatus(c.id, 'EN_ATTENTE')}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-yellow-50 hover:text-yellow-600"
                    title="Remettre en attente"
                  >
                    <Clock size={16} />
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(c.id, 'EN_EXAMEN')}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    title="Mettre en examen"
                  >
                    <Search size={16} />
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(c.id, 'ACCEPTEE')}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-green-50 hover:text-green-600"
                    title="Accepter"
                  >
                    <CircleCheck size={16} />
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(c.id, 'REJETEE')}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    title="Refuser"
                  >
                    <CircleX size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
