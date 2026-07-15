'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, Eye, EyeOff, Plus, X } from 'lucide-react';
import { COLORS } from '../../../lib/constants';
import { api, mapOffre, type ApiOffre, type Job } from '../../../lib/api';

const EMPTY_FORM = {
  titre: '',
  type: 'CDI',
  exigence: '',
  localisation: 'Lomé',
  date_limite: '',
  id_departement: 1, // À adapter avec les vrais départements
  exigences_fichier: 'CV',
};

export default function RHOffresPage() {
  const [offres, setOffres] = useState<ApiOffre[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOffres = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiOffres = await api.rhOffers();
      setOffres(apiOffres);
      const mappedJobs = apiOffres.map(mapOffre);
      setJobs(mappedJobs);
    } catch (err: any) {
      console.error('Erreur lors du chargement des offres:', err);
      setError(err.message || 'Impossible de charger les offres');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOffres();
  }, []);

  const handleToggleStatus = async (offre: ApiOffre) => {
    const newStatus = offre.statut === 'PUBLIEE' ? 'FERMEE' : 'PUBLIEE';
    try {
      await api.updateOffreStatus(offre.id, newStatus);
      loadOffres();
    } catch (err: any) {
      console.error('Erreur lors du changement de statut:', err);
      alert(err.message || 'Erreur lors du changement de statut');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Supprimer cette offre ?')) {
      try {
        await api.deleteOffre(id);
        loadOffres();
      } catch (err: any) {
        console.error('Erreur lors de la suppression:', err);
        alert(err.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleOpenModal = () => {
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createOffre({
        titre: form.titre,
        type: form.type,
        exigence: form.exigence,
        localisation: form.localisation,
        date_limite: form.date_limite || new Date().toISOString().split('T')[0],
        id_departement: form.id_departement,
        exigences_fichier: form.exigences_fichier,
      });
      loadOffres();
      setIsSubmitting(false);
      handleCloseModal();
    } catch (err: any) {
      console.error('Erreur lors de la création:', err);
      alert(err.message || 'Erreur lors de la création');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Offres d'emploi</h1>
          <p className="mt-2 text-sm text-slate-500">
            Gérez toutes les offres d'emploi publiées.
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 rounded-xl bg-[#FFD100] px-5 py-3 text-sm font-bold text-slate-900 transition hover:opacity-95"
        >
          <Plus size={18} />
          Créer une offre
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-400" />
          </div>
        ) : error ? (
          <p className="text-center text-red-600 py-12">{error}</p>
        ) : offres.length === 0 ? (
          <p className="text-center text-gray-500 py-12">Aucune offre</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Poste</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Lieu</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {offres.map((offre) => (
                  <tr key={offre.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/rh/offres/${offre.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                        {offre.titre}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{offre.localisation}</td>
                    <td className="px-4 py-3 text-gray-600">{offre.type}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          offre.statut === 'PUBLIEE'
                            ? 'bg-green-50 text-green-700'
                            : offre.statut === 'BROUILLON'
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {offre.statut === 'PUBLIEE' ? 'Publiée' : offre.statut === 'BROUILLON' ? 'Brouillon' : 'Fermée'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleStatus(offre)}
                          className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
                          title={offre.statut === 'PUBLIEE' ? 'Fermer' : 'Publier'}
                        >
                          {offre.statut === 'PUBLIEE' ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          onClick={() => handleDelete(offre.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modale de création d'offre */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Créer une offre</h2>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Titre du poste *</label>
                <input
                  required
                  value={form.titre}
                  onChange={(e) => setForm({ ...form, titre: e.target.value })}
                  placeholder="Ex: Développeur Full Stack"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD100] focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Lieu</label>
                  <input
                    value={form.localisation}
                    onChange={(e) => setForm({ ...form, localisation: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD100] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD100] focus:border-transparent"
                  >
                    <option>CDI</option>
                    <option>CDD</option>
                    <option>Stage</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Description / Exigences *</label>
                <textarea
                  required
                  rows={4}
                  value={form.exigence}
                  onChange={(e) => setForm({ ...form, exigence: e.target.value })}
                  placeholder="Décris le poste, les exigences et les missions principales."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD100] focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Date limite</label>
                  <input
                    type="date"
                    value={form.date_limite}
                    onChange={(e) => setForm({ ...form, date_limite: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD100] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Département (ID)</label>
                  <input
                    type="number"
                    value={form.id_departement}
                    onChange={(e) => setForm({ ...form, id_departement: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD100] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Exigences fichier</label>
                <input
                  value={form.exigences_fichier}
                  onChange={(e) => setForm({ ...form, exigences_fichier: e.target.value })}
                  placeholder="Ex: CV"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD100] focus:border-transparent"
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
                  className="flex-1 rounded-lg bg-[#FFD100] px-4 py-2 text-sm font-bold text-slate-900 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Enregistrement...' : 'Créer l\'offre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
