'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../../../lib/api';

const initials = (value: string) => (value || '?').charAt(0).toUpperCase();

const EMPTY_FORM = {
  note: '',
  recommandation: 'FAVORABLE' as 'FAVORABLE' | 'DEFAVORABLE',
  rapport: '',
};

export default function SuperviseurAEvaluerPage() {
  const [emplois, setEmplois] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = () => {
    setIsLoading(true);
    setError(null);
    api.getEmploisAEvaluer()
      .then(setEmplois)
      .catch((err) => {
        console.error('Erreur chargement affectations à évaluer:', err);
        setError(err.message || 'Impossible de charger la liste');
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleOpenModal = (emploi: any) => {
    setSelected(emploi);
    setForm(EMPTY_FORM);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelected(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setIsSubmitting(true);
    setFormError(null);

    try {
      await api.createEvaluation({
        id_emploi: selected.id,
        note: form.note ? parseFloat(form.note) : undefined,
        fichier_rapport: form.rapport,
        statut: form.recommandation === 'FAVORABLE',
      });
      handleCloseModal();
      load();
    } catch (err: any) {
      setFormError(err.message || "Erreur lors de l'envoi de l'évaluation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">À évaluer</h1>
        <p className="mt-2 text-slate-500">Les stagiaires/employés qui attendent ton retour.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-slate-400" />
        </div>
      ) : error ? (
        <p className="text-center text-red-600 py-12">{error}</p>
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1e3a8a] font-bold text-white">
                      {initials(candidat?.nom)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {candidat?.prenom} {candidat?.nom}
                      </p>
                      <p className="truncate text-sm text-slate-500">
                        {emploi.sujet} · {emploi.candidature?.offre?.type} · {emploi.departement?.nom}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenModal(emploi)}
                    className="shrink-0 rounded-xl bg-[#facc15] px-4 py-2 text-sm font-bold text-[#1e3a8a] transition hover:opacity-90"
                  >
                    Évaluer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modale d'évaluation */}
      {isModalOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Évaluation</h2>
                <p className="text-sm text-gray-500">
                  {selected.candidature?.utilisateur?.prenom} {selected.candidature?.utilisateur?.nom} — {selected.sujet}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-md">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Note /20</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    placeholder="Ex: 15.5"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Recommandation *</label>
                  <select
                    required
                    value={form.recommandation}
                    onChange={(e) => setForm({ ...form, recommandation: e.target.value as 'FAVORABLE' | 'DEFAVORABLE' })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                  >
                    <option value="FAVORABLE">Favorable</option>
                    <option value="DEFAVORABLE">Défavorable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Rapport d&apos;évaluation *</label>
                <textarea
                  required
                  rows={6}
                  value={form.rapport}
                  onChange={(e) => setForm({ ...form, rapport: e.target.value })}
                  placeholder="Points forts, axes d'amélioration, appréciation générale..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
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
                  {isSubmitting ? 'Envoi...' : "Soumettre l'évaluation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
