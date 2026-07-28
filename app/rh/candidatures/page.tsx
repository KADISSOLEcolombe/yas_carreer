'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { CircleCheck, CircleX, Filter, Download, Search, X, Clock } from 'lucide-react';
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

const STATUS_FILTERS = [
  { value: 'TOUS', label: 'Tous' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'IN_REVIEW', label: 'En examen' },
  { value: 'INTERVIEW', label: 'Entretien' },
  { value: 'ACCEPTED', label: 'Accepté' },
  { value: 'REJECTED', label: 'Refusé' },
];

function StatusBadge({ status }: { status: Application['status'] }) {
  const style = STATUS_STYLES[status];
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

export default function RHCandidaturesPage() {
  const [candidatures, setCandidatures] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TOUS');
  const [showFilters, setShowFilters] = useState(false);

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

  const filteredCandidatures = useMemo(() => {
    return candidatures.filter((c) => {
      const matchesSearch = !searchTerm || 
        c.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'TOUS' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [candidatures, searchTerm, statusFilter]);

  const activeFiltersCount = (statusFilter !== 'TOUS' ? 1 : 0) + (searchTerm ? 1 : 0);

  const handleChangeStatus = async (id: string, status: Application['status']) => {
    try {
      await api.updateApplicationStatus(Number(id), mapStatusToBackend(status));
      // Recharger la liste
      const apiCandidatures = await api.getAllApplications();
      const mappedCandidatures = apiCandidatures.map(mapCandidature);
      setCandidatures(mappedCandidatures);
    } catch (err: any) {
      console.error('Erreur lors du changement de statut:', err);
      alert(err.message || 'Erreur lors du changement de statut');
    }
  };

  return (
    <div className="space-y-6">
      <RhDashboardHeader />

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <h2 className="text-lg font-bold text-gray-900">Toutes les candidatures ({filteredCandidatures.length})</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-gray-50 ${
                showFilters || activeFiltersCount > 0 ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Filter size={15} />
              Filtrer
              {activeFiltersCount > 0 && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                const csv = [['Nom', 'Email', 'Poste', 'Statut', 'Date']].concat(
                  filteredCandidatures.map(c => [c.nom, c.email, c.jobTitle, c.status, new Date(c.createdAt).toLocaleDateString('fr-FR')])
                ).map(row => row.join(',')).join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'candidatures.csv';
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
            >
              <Download size={15} />
              Exporter
            </button>
          </div>
        </div>

        {/* Filtres */}
        {showFilters && (
          <div className="border-b border-gray-100 px-6 py-4 space-y-3">
            <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, poste ou email..."
                className="flex-1 outline-none text-sm text-gray-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === f.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: COLORS.midnight }} />
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-600">{error}</p>
            </div>
          ) : filteredCandidatures.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">Aucune candidature trouvée</p>
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => { setSearchTerm(''); setStatusFilter('TOUS'); }}
                  className="mt-2 text-sm text-blue-600 hover:underline"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            filteredCandidatures.map((c) => (
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
                  <ScoreBadge score={c.score} />
                  <StatusBadge status={c.status} />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleChangeStatus(c.id, 'PENDING');
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-yellow-50 hover:text-yellow-600"
                    title="Remettre en attente"
                  >
                    <Clock size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleChangeStatus(c.id, 'IN_REVIEW');
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    title="Mettre en examen"
                  >
                    <Search size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleChangeStatus(c.id, 'ACCEPTED');
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-green-50 hover:text-green-600"
                    title="Accepter"
                  >
                    <CircleCheck size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleChangeStatus(c.id, 'REJECTED');
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
