'use client';

import { useEffect, useState } from 'react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import AdminDashboardHeader from '../../../components/admin/AdminDashboardHeader';
import { api, type ApiOffre } from '../../../lib/api';

export default function AdminOffresPage() {
  const [offres, setOffres] = useState<ApiOffre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOffres = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.rhOffers();
      setOffres(data);
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

  const handleToggleActive = async (offre: ApiOffre) => {
    const nouveauStatut = offre.statut === 'PUBLIEE' ? 'FERMEE' : 'PUBLIEE';
    try {
      await api.updateOffreStatus(offre.id, nouveauStatut);
      await loadOffres();
    } catch (err: any) {
      alert(err.message || 'Erreur lors du changement de statut');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette offre ?')) return;
    try {
      await api.deleteOffre(id);
      await loadOffres();
    } catch (err: any) {
      alert(err.message || "Erreur lors de la suppression de l'offre");
    }
  };

  return (
    <div className="space-y-6">
      <AdminDashboardHeader />

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <h2 className="text-lg font-bold text-gray-900">Toutes les offres ({offres.length})</h2>
        </div>

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
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Département</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Lieu</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {offres.map((offre) => {
                  const active = offre.statut === 'PUBLIEE';
                  return (
                    <tr key={offre.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{offre.titre}</td>
                      <td className="px-4 py-3 text-gray-600">{offre.departement?.nom || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{offre.localisation}</td>
                      <td className="px-4 py-3 text-gray-600">{offre.type}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {offre.statut === 'PUBLIEE' ? 'Publiée' : offre.statut === 'FERMEE' ? 'Fermée' : 'Brouillon'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleToggleActive(offre)}
                            className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
                            title={active ? 'Fermer' : 'Publier'}
                          >
                            {active ? <EyeOff size={16} /> : <Eye size={16} />}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
