'use client';

import { Users, Briefcase, FileText, Activity } from 'lucide-react';
import AdminDashboardHeader from '../../../components/admin/AdminDashboardHeader';

const COLORS = {
  midnight: '#1e3a8a',
};

const STAT_CARDS = [
  { label: 'Utilisateurs', value: '6', icon: Users, bg: '#DBEAFE', color: '#1E40AF' },
  { label: 'Offres publiées', value: '6', icon: Briefcase, bg: '#FEF3C7', color: '#92400E' },
  { label: 'Candidatures', value: '6', icon: FileText, bg: '#EDE9FE', color: '#6D28D9' },
  { label: 'Disponibilité', value: '99.8%', icon: Activity, bg: '#D1FAE5', color: '#065F46' },
];

const USERS_PAR_ROLE = [
  { label: 'Candidats', value: 4, color: COLORS.midnight },
  { label: 'RH', value: 1, color: '#facc15' },
  { label: 'Superviseurs', value: 1, color: '#5F99D2' },
  { label: 'Admins', value: 1, color: '#F97316' },
];

const ACTIVITE_RECENTE = [
  { titre: 'Nouvelle offre publiée', description: 'Développeur Full Stack', temps: 'Il y a 2h' },
  { titre: 'Candidature reçue', description: 'Kodjo Mensah → Dev Full Stack', temps: 'Il y a 3h' },
  { titre: 'Entretien planifié', description: 'Akossiwa Gnammi — 23 Jan', temps: 'Il y a 5h' },
  { titre: 'Offre clôturée', description: 'Stage UX/UI', temps: 'Hier' },
];

export default function AdminDashboardPage() {
  const maxValue = Math.max(...USERS_PAR_ROLE.map((r) => r.value));

  return (
    <div className="space-y-6">
      <AdminDashboardHeader />

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-2xl bg-white p-5 shadow-sm">
              <div
                className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ backgroundColor: card.bg, color: card.color }}
              >
                <Icon size={20} />
              </div>
              <p className="text-3xl font-extrabold text-gray-900">{card.value}</p>
              <p className="mt-1 text-sm text-gray-500">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Utilisateurs par rôle + Activité récente */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-gray-900">Utilisateurs par rôle</h2>
          <div className="space-y-4">
            {USERS_PAR_ROLE.map((role) => (
              <div key={role.label} className="flex items-center gap-4">
                <span className="w-28 shrink-0 text-sm text-gray-700">{role.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(role.value / maxValue) * 100}%`, backgroundColor: role.color }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-sm font-semibold text-gray-900">{role.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-gray-900">Activité récente</h2>
          <div className="space-y-4">
            {ACTIVITE_RECENTE.map((item) => (
              <div key={item.titre} className="flex items-start gap-3">
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: COLORS.midnight }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-gray-900">{item.titre}</p>
                  <p className="truncate text-sm text-gray-500">{item.description}</p>
                </div>
                <span className="shrink-0 text-xs text-gray-400">{item.temps}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
