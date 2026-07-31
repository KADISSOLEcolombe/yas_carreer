'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  PLANIFIE: { bg: '#FEF3C7', text: '#92400E', label: 'Planifié' },
  TERMINE: { bg: '#D1FAE5', text: '#065F46', label: 'Terminé' },
  ANNULE: { bg: '#FEE2E2', text: '#DC2626', label: 'Annulé' },
};

export default function SuperviseurEntretiensPage() {
  const [entretiens, setEntretiens] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getMyEntretiens()
      .then(setEntretiens)
      .catch((err) => {
        console.error('Erreur chargement de mes entretiens:', err);
        setError(err.message || 'Impossible de charger vos entretiens');
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Mes entretiens</h1>
        <p className="mt-2 text-slate-500">Entretiens prévus avec les candidats.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-slate-400" />
        </div>
      ) : error ? (
        <p className="text-center text-red-600 py-12">{error}</p>
      ) : entretiens.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-slate-500">Aucun entretien qui vous est assigné pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entretiens.map((interview) => {
            const style = STATUS_STYLES[interview.statut] || { bg: '#E2E8F0', text: '#4B5563', label: interview.statut };
            const date = new Date(interview.date);
            return (
              <div key={interview.id} className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {interview.candidature?.utilisateur?.prenom} {interview.candidature?.utilisateur?.nom}
                    </p>
                    <p className="text-sm text-slate-500">{interview.candidature?.offre?.titre}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {date.toLocaleDateString('fr-FR')} · {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: style.bg, color: style.text }}>
                      {style.label}
                    </span>
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
