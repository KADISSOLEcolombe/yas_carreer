'use client';

import { useEffect, useState } from 'react';
import { UserPlus, Trash2, X, Power } from 'lucide-react';
import AdminDashboardHeader from '../../../components/admin/AdminDashboardHeader';
import { api, type User, type UserRole } from '../../../lib/api';

const COLORS = {
  midnight: '#1e3a8a',
};

type RoleCreable = 'RH' | 'SUPERVISEUR' | 'ADMIN';

const ROLE_BADGE: Record<UserRole, { bg: string; text: string; label: string }> = {
  CANDIDAT: { bg: '#DBEAFE', text: '#1E40AF', label: 'Candidat' },
  RH: { bg: '#FEF3C7', text: '#92400E', label: 'RH' },
  ADMIN: { bg: '#EDE9FE', text: '#6D28D9', label: 'Administrateur' },
  SUPERVISEUR: { bg: '#D1FAE5', text: '#065F46', label: 'Superviseur' },
};

const EMPTY_FORM = {
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  quartier: '',
  password: '',
  role: 'RH' as RoleCreable,
};

function RoleBadge({ role }: { role: UserRole }) {
  const style = ROLE_BADGE[role] || { bg: '#E2E8F0', text: '#4B5563', label: role };
  return (
    <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: style.bg, color: style.text }}>
      {style.label}
    </span>
  );
}

function StatusBadge({ active }: { active?: boolean }) {
  return active ? (
    <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>
      Actif
    </span>
  ) : (
    <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: '#F3F4F6', color: '#4B5563' }}>
      Inactif
    </span>
  );
}

export default function AdminAccountsPage() {
  const [utilisateurs, setUtilisateurs] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getUsers();
      setUtilisateurs(data);
    } catch (err: any) {
      console.error('Erreur lors du chargement des utilisateurs:', err);
      setError(err.message || 'Impossible de charger les utilisateurs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenModal = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setForm(EMPTY_FORM);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const data = {
      nom: form.nom,
      prenom: form.prenom,
      email: form.email,
      telephone: form.telephone,
      quartier: form.quartier,
      password: form.password,
    };

    try {
      if (form.role === 'RH') {
        await api.createRhAccount(data);
      } else if (form.role === 'SUPERVISEUR') {
        await api.createSuperviseurAccount(data);
      } else {
        await api.createAdminAccount(data);
      }
      await loadUsers();
      handleCloseModal();
    } catch (err: any) {
      setFormError(err.message || 'Erreur lors de la création du compte');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (u: User) => {
    try {
      await api.toggleUserStatus(u.id, !u.active);
      await loadUsers();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la mise à jour du statut');
    }
  };

  const handleDelete = async (id: number, nom: string) => {
    if (!confirm(`Supprimer l'utilisateur « ${nom} » ? Cette action est irréversible.`)) return;
    try {
      await api.deleteUser(id);
      await loadUsers();
    } catch (err: any) {
      alert(err.message || "Erreur lors de la suppression de l'utilisateur");
    }
  };

  return (
    <div className="space-y-6">
      <AdminDashboardHeader />

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <h2 className="text-lg font-bold text-gray-900">Gestion des utilisateurs ({utilisateurs.length})</h2>
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: COLORS.midnight }}
          >
            <UserPlus size={16} />
            Ajouter
          </button>
        </div>

        <div className="px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-400" />
            </div>
          ) : error ? (
            <p className="text-center text-red-600 py-12">{error}</p>
          ) : utilisateurs.length === 0 ? (
            <p className="text-center text-gray-500 py-12">Aucun utilisateur</p>
          ) : (
            utilisateurs.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-4 border-b border-gray-100 py-4 last:border-b-0">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: COLORS.midnight }}
                  >
                    {u.nom.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-gray-900">{u.prenom} {u.nom}</p>
                    <p className="truncate text-sm text-gray-500">{u.email}</p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <RoleBadge role={u.role} />
                  <StatusBadge active={u.active} />
                  <button
                    onClick={() => handleToggleStatus(u)}
                    title={u.active ? 'Désactiver ce compte' : 'Activer ce compte'}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  >
                    <Power size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(u.id, `${u.prenom} ${u.nom}`)}
                    title="Supprimer ce compte"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modale de création d'utilisateur */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Ajouter un utilisateur</h2>
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
                  <label className="mb-2 block text-sm font-medium text-gray-700">Nom *</label>
                  <input
                    required
                    type="text"
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    placeholder="Ex: Dupont"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Prénom</label>
                  <input
                    type="text"
                    value={form.prenom}
                    onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                    placeholder="Ex: Jean"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">E-mail *</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Ex: jean.dupont@email.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Mot de passe *</label>
                <input
                  required
                  type="password"
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimum 6 caractères"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Rôle *</label>
                <select
                  required
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as RoleCreable })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                >
                  <option value="RH">RH</option>
                  <option value="SUPERVISEUR">Superviseur</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
                <p className="mt-1 text-xs text-gray-400">
                  Les comptes Candidat s&apos;inscrivent eux-mêmes depuis le site.
                </p>
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
                  style={{ backgroundColor: COLORS.midnight }}
                >
                  {isSubmitting ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
