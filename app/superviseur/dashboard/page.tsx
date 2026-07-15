'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { CANDIDATS_A_EVALUER, DERNIERES_EVALUATIONS } from '../../../lib/superviseur-data';

const STATUS_STYLES = {
  'Validée': { bg: '#D1FAE5', text: '#065F46' },
  'En attente': { bg: '#FEF3C7', text: '#92400E' },
} as const;

const EMPTY_FORM = {
  note: '',
  commentaire: '',
  recommandation: 'Validée' as 'Validée' | 'Refusée' | 'En attente',
};

const initials = (value: string) => value.charAt(0).toUpperCase();

export default function SuperviseurDashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<typeof CANDIDATS_A_EVALUER[0] | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = (candidate: typeof CANDIDATS_A_EVALUER[0]) => {
    setSelectedCandidate(candidate);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCandidate(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulation de soumission
    setTimeout(() => {
      setIsSubmitting(false);
      handleCloseModal();
      alert('Évaluation soumise avec succès !');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Candidats à évaluer</h2>
              <p className="text-sm text-slate-500">Liste des profils en attente de ton retour</p>
            </div>
            <Link href="/superviseur/a-evaluer" className="text-sm font-semibold text-[#1e3a8a] hover:underline">
              Voir tout
            </Link>
          </div>

          <div className="space-y-4">
            {CANDIDATS_A_EVALUER.map((candidate) => (
              <div key={candidate.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1e3a8a] text-sm font-bold text-white">
                    {initials(candidate.nom)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{candidate.nom}</p>
                    <p className="truncate text-sm text-slate-500">{candidate.poste}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenModal(candidate)}
                  className="shrink-0 rounded-xl bg-[#facc15] px-4 py-2 text-sm font-bold text-[#1e3a8a] transition hover:opacity-90"
                >
                  Évaluer
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Mes dernières évaluations</h2>
              <p className="text-sm text-slate-500">Historique récent de mes retours</p>
            </div>
            <Link href="/superviseur/evaluations" className="text-sm font-semibold text-[#1e3a8a] hover:underline">
              Voir tout
            </Link>
          </div>

          <div className="space-y-4">
            {DERNIERES_EVALUATIONS.map((item) => {
              const statusStyle = STATUS_STYLES[item.status];
              return (
                <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{item.nom}</p>
                      <p className="truncate text-sm text-slate-500">{item.poste}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex rounded-full bg-[#1e3a8a] px-3 py-1 text-xs font-bold text-white">
                        {item.note}
                      </span>
                      <span
                        className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                        style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                      >
                        {item.status}
                      </span>
                      <span className="text-xs text-slate-500">{item.date}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modale d'évaluation */}
      {isModalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Évaluer le candidat</h2>
                <p className="text-sm text-gray-500">{selectedCandidate.nom} - {selectedCandidate.poste}</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Note /20 *</label>
                <input
                  required
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="Ex: 15.5"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Recommandation *</label>
                <select
                  required
                  value={form.recommandation}
                  onChange={(e) => setForm({ ...form, recommandation: e.target.value as 'Validée' | 'Refusée' | 'En attente' })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                >
                  <option value="Validée">Validée</option>
                  <option value="Refusée">Refusée</option>
                  <option value="En attente">En attente</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Commentaire</label>
                <textarea
                  rows={5}
                  value={form.commentaire}
                  onChange={(e) => setForm({ ...form, commentaire: e.target.value })}
                  placeholder="Décrivez votre évaluation du candidat..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-lg px-4 py-2 text-sm font-bold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                  style={{ backgroundColor: '#1e3a8a' }}
                >
                  {isSubmitting ? 'Soumission...' : 'Soumettre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
