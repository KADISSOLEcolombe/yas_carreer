'use client';

import { useState } from 'react';
import { UserPlus, Pencil, Trash2 } from 'lucide-react';
import AdminDashboardHeader from '../../../components/admin/AdminDashboardHeader';

const COLORS = {
  midnight: '#1e3a8a',
};

type Role = 'candidate' | 'hr' | 'admin' | 'supervisor';
type Status = 'ACTIF' | 'INACTIF';

interface Utilisateur {
  id: number;
  nom: string;
  email: string;
  role: Role;
  statut: Status;
  date: string;
}

const ROLE_BADGE: Record<Role, { bg: string; text: string }> = {
  candidate: { bg: '#DBEAFE', text: '#1E40AF' },
  hr: { bg: '#FEF3C7', text: '#92400E' },
  admin: { bg: '#EDE9FE', text: '#6D28D9' },
  supervisor: { bg: '#D1FAE5', text: '#065F46' },
};

const STATUS_BADGE: Record<Status, { bg: string; text: string; label: string }> = {
  ACTIF: { bg: '#D1FAE5', text: '#065F46', label: 'Actif' },
  INACTIF: { bg: '#F3F4F6', text: '#4B5563', label: 'Inactif' },
};

// Données d'exemple en dur — à remplacer par un appel API plus tard
const MOCK_UTILISATEURS: Utilisateur[] = [
  { id: 1, nom: 'Candidat Demo', email: 'candidat@yas.tg', role: 'candidate', statut: 'ACTIF', date: '17/01/2025' },
  { id: 2, nom: 'Marie Dupont', email: 'hr@yas.tg', role: 'hr', statut: 'ACTIF', date: '16/01/2025' },
  { id: 3, nom: 'Admin YAS', email: 'admin@yas.tg', role: 'admin', statut: 'ACTIF', date: '17/01/2025' },
  { id: 4, nom: 'Kofi Supervisor', email: 'supervisor@yas.tg', role: 'supervisor', statut: 'ACTIF', date: '15/01/2025' },
  { id: 5, nom: 'Ama Koffi', email: 'ama@yas.tg', role: 'candidate', statut: 'INACTIF', date: '10/01/2025' },
  { id: 6, nom: 'Kwame Tossou', email: 'kwame@yas.tg', role: 'candidate', statut: 'ACTIF', date: '12/01/2025' },
];

function RoleBadge({ role }: { role: Role }) {
  const style = ROLE_BADGE[role];
  return (
    <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: style.bg, color: style.text }}>
      {role}
    </span>
  );
}

function StatusBadge({ statut }: { statut: Status }) {
  const style = STATUS_BADGE[statut];
  return (
    <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: style.bg, color: style.text }}>
      {style.label}
    </span>
  );
}

export default function AdminAccountsPage() {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>(MOCK_UTILISATEURS);

  const handleAjouter = () => {
    alert("Formulaire de création d'utilisateur à venir.");
  };

  const handleEdit = (nom: string) => {
    alert(`Modifier « ${nom} » — formulaire à venir.`);
  };

  const handleDelete = (id: number, nom: string) => {
    if (confirm(`Supprimer l'utilisateur « ${nom} » ? Cette action est irréversible.`)) {
      setUtilisateurs((prev) => prev.filter((u) => u.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <AdminDashboardHeader />

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <h2 className="text-lg font-bold text-gray-900">Gestion des utilisateurs ({utilisateurs.length})</h2>
          <button
            onClick={handleAjouter}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: COLORS.midnight }}
          >
            <UserPlus size={16} />
            Ajouter
          </button>
        </div>

        <div className="px-6">
          {utilisateurs.map((u) => (
            <div key={u.id} className="flex items-center justify-between gap-4 border-b border-gray-100 py-4 last:border-b-0">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: COLORS.midnight }}
                >
                  {u.nom.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-bold text-gray-900">{u.nom}</p>
                  <p className="truncate text-sm text-gray-500">{u.email}</p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <RoleBadge role={u.role} />
                <StatusBadge statut={u.statut} />
                <span className="text-sm text-gray-500">{u.date}</span>
                <button
                  onClick={() => handleEdit(u.nom)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(u.id, u.nom)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
