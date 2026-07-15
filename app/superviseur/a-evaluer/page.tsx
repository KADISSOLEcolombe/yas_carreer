'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { CANDIDATS_A_EVALUER } from '../../../lib/superviseur-data';

const initials = (value: string) => value.charAt(0).toUpperCase();

const EMPTY_FORM = {
  note: '',
  recommandation: 'Validée' as 'Validée' | 'Refusée' | 'En attente',
  rapport: '',
  pointsFort: '',
  pointsAmelioration: '',
};

export default function SuperviseurAEvaluerPage() {
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
      <div>
        <h1 className="text-3xl font-bold text-slate-900">À évaluer</h1>
        <p className="mt-2 text-slate-500">Les candidats qui attendent ton retour.</p>
      </div>

      <div className="grid gap-4">
        {CANDIDATS_A_EVALUER.map((candidate) => (
          <div key={candidate.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1e3a8a] font-bold text-white">
                  {initials(candidate.nom)}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{candidate.nom}</p>
                  <p className="truncate text-sm text-slate-500">{candidate.poste}</p>
                </div>
              </div>
              <button
                onClick={() => handleOpenModal(candidate)}
                className="rounded-xl bg-[#facc15] px-4 py-2 text-sm font-bold text-[#1e3a8a] transition hover:opacity-90"
              >
                Évaluer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modale d'évaluation */}
      {isModalOpen && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Évaluation du candidat</h2>
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Évalué par</label>
                  <input
                    type="text"
                    value="Superviseur"
                    disabled
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm bg-gray-50 text-gray-600"
                  />
                </div>
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
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Recommandation *</label>
                <select
                  required
                  value={form.recommandation}
                  onChange={(e) => setForm({ ...form, recommandation: e.target.value as 'Validée' | 'Refusée' | 'En attente' })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                >
                  <option value="Validée">Validée - Recommandé pour le poste</option>
                  <option value="Refusée">Refusée - Non recommandé</option>
                  <option value="En attente">En attente - Besoin d'informations supplémentaires</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Rapport d'évaluation *</label>
                <textarea
                  required
                  rows={4}
                  value={form.rapport}
                  onChange={(e) => setForm({ ...form, rapport: e.target.value })}
                  placeholder="Rédigez un rapport détaillé sur votre évaluation du candidat..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Points forts</label>
                  <textarea
                    rows={3}
                    value={form.pointsFort}
                    onChange={(e) => setForm({ ...form, pointsFort: e.target.value })}
                    placeholder="Listez les points forts du candidat..."
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Points d'amélioration</label>
                  <textarea
                    rows={3}
                    value={form.pointsAmelioration}
                    onChange={(e) => setForm({ ...form, pointsAmelioration: e.target.value })}
                    placeholder="Listez les axes d'amélioration potentiels..."
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                  />
                </div>
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
                  {isSubmitting ? 'Soumission...' : 'Soumettre l\'évaluation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
