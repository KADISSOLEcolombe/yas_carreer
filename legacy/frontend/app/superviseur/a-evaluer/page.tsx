'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { api } from '../../../lib/api';

const initials = (value: string) => (value || '?').charAt(0).toUpperCase();

export default function SuperviseurAEvaluerPage() {
  const [emplois, setEmplois] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    api
      .getEmploisAEvaluer()
      .then(setEmplois)
      .catch((err) => {
        console.error('Erreur chargement affectations à évaluer:', err);
        setError(err.message || 'Impossible de charger la liste');
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">À évaluer</h1>
        <p className="mt-2 text-slate-500">Les stagiaires/employés qui attendent ton retour.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-slate-400" />
        </div>
      ) : error ? (
        <p className="py-12 text-center text-red-600">{error}</p>
      ) : emplois.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-slate-500">Personne à évaluer pour le moment.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {emplois.map((emploi) => {
            const candidat = emploi.candidature?.utilisateur;
            return (
              <div key={emploi.id} className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00377D] font-bold text-white">
                      {initials(candidat?.nom)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {candidat?.prenom} {candidat?.nom}
                      </p>
                      <p className="truncate text-sm text-slate-500">
                        {emploi.sujet} · {emploi.candidature?.offre?.type} · {emploi.departement?.nom}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {emploi.date_debut ? new Date(emploi.date_debut).toLocaleDateString('fr-FR') : '—'}
                        {' → '}
                        {emploi.date_fin ? new Date(emploi.date_fin).toLocaleDateString('fr-FR') : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      href={`/superviseur/emplois/${emploi.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-[#00377D] hover:bg-[#FFD100]/20"
                      title="Voir le dossier"
                    >
                      <Eye size={16} />
                      Détails
                    </Link>
                    <Link
                      href={`/superviseur/emplois/${emploi.id}`}
                      className="rounded-xl bg-[#FFD100] px-4 py-2 text-sm font-bold text-[#00377D] transition hover:opacity-90"
                    >
                      Évaluer
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
