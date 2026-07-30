'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';

const initials = (value: string) => (value || '?').charAt(0).toUpperCase();

export default function SuperviseurDashboardPage() {
  const [emplois, setEmplois] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getEmploisAEvaluer(), api.getEvaluations()])
      .then(([emploisData, evaluationsData]) => {
        setEmplois(emploisData);
        setEvaluations(evaluationsData);
      })
      .catch((err) => console.error('Erreur chargement dashboard superviseur:', err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">À évaluer</h2>
              <p className="text-sm text-slate-500">Stagiaires/employés en attente de ton retour</p>
            </div>
            <Link href="/superviseur/a-evaluer" className="text-sm font-semibold text-[#00377D] hover:underline">
              Voir tout
            </Link>
          </div>

          {emplois.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">Personne à évaluer pour le moment.</p>
          ) : (
            <div className="space-y-4">
              {emplois.slice(0, 5).map((emploi) => {
                const candidat = emploi.candidature?.utilisateur;
                return (
                  <div key={emploi.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#00377D] text-sm font-bold text-white">
                        {initials(candidat?.nom)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">{candidat?.prenom} {candidat?.nom}</p>
                        <p className="truncate text-sm text-slate-500">{emploi.sujet}</p>
                      </div>
                    </div>
                    <Link
                      href={`/superviseur/emplois/${emploi.id}`}
                      className="shrink-0 rounded-xl bg-[#FFD100] px-4 py-2 text-sm font-bold text-[#00377D] transition hover:opacity-90"
                    >
                      Voir
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Mes dernières évaluations</h2>
              <p className="text-sm text-slate-500">Historique récent de mes retours</p>
            </div>
            <Link href="/superviseur/evaluations" className="text-sm font-semibold text-[#00377D] hover:underline">
              Voir tout
            </Link>
          </div>

          {evaluations.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">Aucune évaluation pour le moment.</p>
          ) : (
            <div className="space-y-4">
              {evaluations.slice(0, 5).map((item) => {
                const candidat = item.emploi?.candidature?.utilisateur;
                const favorable = item.statut === true;
                return (
                  <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">{candidat?.prenom} {candidat?.nom}</p>
                        <p className="truncate text-sm text-slate-500">{item.emploi?.sujet}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {item.note != null && (
                          <span className="inline-flex rounded-full bg-[#00377D] px-3 py-1 text-xs font-bold text-white">
                            {item.note}
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
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
