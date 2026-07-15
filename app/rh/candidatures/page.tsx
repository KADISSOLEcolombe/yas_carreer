'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CircleCheck, CircleX, Filter, Download } from 'lucide-react';
import RhDashboardHeader from '../../../components/rh/RhDashboardHeader';
import { api, mapCandidature, mapStatusToBackend, type Application } from '../../../lib/api';

const COLORS = {
  midnight: '#1e3a8a',
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
    <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: style.bg, color: style.text }}>
      {style.label}
    </span>
  );
}

export default function RHCandidaturesPage() {
  const [candidatures, setCandidatures] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCandidatures = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const apiCandidatures = await api.getAllApplications();
        const mappedCandidatures = apiCandidatures.map(mapCandidature);
        setCandidatures(mappedCandidatures);
      } catch (err: any) {
        console.error('Erreur lors du chargement des candidatures:', err);
        setError(err.message || 'Impossible de charger les candidatures');
      } finally {
        setIsLoading(false);
      }
    };

    loadCandidatures();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      await api.updateApplicationStatus(Number(id), mapStatusToBackend('ACCEPTED'));
      // Recharger la liste
      const apiCandidatures = await api.getAllApplications();
      const mappedCandidatures = apiCandidatures.map(mapCandidature);
      setCandidatures(mappedCandidatures);
    } catch (err: any) {
      console.error('Erreur lors de l\'acceptation:', err);
      alert(err.message || 'Erreur lors de l\'acceptation');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.updateApplicationStatus(Number(id), mapStatusToBackend('REJECTED'));
      // Recharger la liste
      const apiCandidatures = await api.getAllApplications();
      const mappedCandidatures = apiCandidatures.map(mapCandidature);
      setCandidatures(mappedCandidatures);
    } catch (err: any) {
      console.error('Erreur lors du rejet:', err);
      alert(err.message || 'Erreur lors du rejet');
    }
  };

  return (
    <div className="space-y-6">
      <RhDashboardHeader />

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <h2 className="text-lg font-bold text-gray-900">Toutes les candidatures ({candidatures.length})</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Filtres à venir.')}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
            >
              <Filter size={15} />
              Filtrer
            </button>
            <button
              onClick={() => alert('Export à venir.')}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
            >
              <Download size={15} />
              Exporter
            </button>
          </div>
        </div>

        <div className="px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: COLORS.midnight }} />
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-600">{error}</p>
            </div>
          ) : candidatures.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">Aucune candidature</p>
            </div>
          ) : (
            candidatures.map((c) => (
              <Link
                key={c.id}
                href={`/rh/candidatures/${c.id}`}
                className="flex items-center justify-between gap-4 border-b border-gray-100 py-4 last:border-b-0 transition-colors hover:bg-gray-50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: COLORS.midnight }}
                  >
                    {c.nom.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-gray-900">{c.nom}</p>
                    <p className="truncate text-sm text-gray-500">
                      {c.jobTitle} · {new Date(c.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge status={c.status} />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleAccept(c.id);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-green-50 hover:text-green-600"
                    title="Accepter"
                  >
                    <CircleCheck size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleReject(c.id);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    title="Refuser"
                  >
                    <CircleX size={16} />
                  </button>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
