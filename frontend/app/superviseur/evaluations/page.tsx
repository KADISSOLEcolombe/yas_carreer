'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';

export default function SuperviseurEvaluationsPage() {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getEvaluations()
      .then(setEvaluations)
      .catch((err) => {
        console.error('Erreur chargement de mes évaluations:', err);
        setError(err.message || 'Impossible de charger vos évaluations');
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Mes évaluations</h1>
        <p className="mt-2 text-slate-500">Historique de toutes mes évaluations.</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-slate-400" />
          </div>
        ) : error ? (
          <p className="text-center text-red-600 py-8">{error}</p>
        ) : evaluations.length === 0 ? (
          <p className="text-center text-sm text-slate-500 py-8">Aucune évaluation pour le moment.</p>
        ) : (
          <div className="space-y-4">
            {evaluations.map((item) => {
              const candidat = item.emploi?.candidature?.utilisateur;
              const favorable = item.statut === true;
              return (
                <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {candidat?.prenom} {candidat?.nom}
                      </p>
                      <p className="truncate text-sm text-slate-500">{item.emploi?.sujet}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {item.note != null && (
                        <span className="inline-flex rounded-full bg-[#1e3a8a] px-3 py-1 text-xs font-bold text-white">
                          {item.note}/20
                        </span>
                      )}
                      <span
                        className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                        style={
                          favorable
                            ? { backgroundColor: '#D1FAE5', color: '#065F46' }
                            : { backgroundColor: '#FEE2E2', color: '#DC2626' }
                        }
                      >
                        {favorable ? 'Favorable' : 'Défavorable'}
                      </span>
                    </div>
                  </div>
                  {item.fichier_rapport && (
                    <p className="mt-3 text-sm text-slate-600 whitespace-pre-line">{item.fichier_rapport}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
