'use client';

import { useEffect, useState } from 'react';
import { Users, Briefcase, FileText, Clock } from 'lucide-react';
import AdminDashboardHeader from '../../../components/admin/AdminDashboardHeader';
import { api, type ApiCandidature, type ApiOffre } from '../../../lib/api';

const COLORS = {
  midnight: '#1e3a8a',
};

const ROLE_LABELS: Record<string, string> = {
  Candidat: 'Candidats',
  RH: 'RH',
  Superviseur: 'Superviseurs',
  Administrateur: 'Admins',
  'Responsable RH': 'Responsables RH',
};

const ROLE_COLORS: Record<string, string> = {
  Candidat: COLORS.midnight,
  RH: '#facc15',
  Superviseur: '#5F99D2',
  Administrateur: '#F97316',
  'Responsable RH': '#10b981',
};

function ilYA(dateStr: string): string {
  const heures = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60));
  if (heures < 1) return "À l'instant";
  if (heures < 24) return `Il y a ${heures}h`;
  const jours = Math.floor(heures / 24);
  if (jours === 1) return 'Hier';
  return `Il y a ${jours} jours`;
}

interface ActiviteItem {
  titre: string;
  description: string;
  date: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<{
    totaux: { utilisateurs: number; offres: number; offresPubliees: number; candidatures: number };
    utilisateursParRole: Array<{ role: string; count: number }>;
    candidaturesParStatut: Array<{ statut: string; count: number }>;
  } | null>(null);
  const [activite, setActivite] = useState<ActiviteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [statsData, candidatures, offres] = await Promise.all([
          api.getAdminStats(),
          api.getAllApplications(),
          api.rhOffers(),
        ]);
        setStats(statsData);

        const activiteCandidatures: ActiviteItem[] = (candidatures as ApiCandidature[]).map((c) => ({
          titre: 'Candidature reçue',
          description: `${c.utilisateur?.prenom} ${c.utilisateur?.nom} → ${c.offre?.titre}`,
          date: c.date_soumission,
        }));
        const activiteOffres: ActiviteItem[] = (offres as ApiOffre[])
          .filter((o) => o.statut === 'PUBLIEE')
          .map((o) => ({
            titre: 'Offre publiée',
            description: o.titre,
            date: o.date_publication,
          }));
        const toutesActivites = [...activiteCandidatures, ...activiteOffres]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);
        setActivite(toutesActivites);
      } catch (err) {
        console.error('Erreur chargement dashboard admin:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <AdminDashboardHeader />
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: COLORS.midnight }} />
        </div>
      </div>
    );
  }

  const enAttente = stats.candidaturesParStatut.find((c) => c.statut === 'EN_ATTENTE')?.count || 0;

  const STAT_CARDS = [
    { label: 'Utilisateurs', value: stats.totaux.utilisateurs, icon: Users, bg: '#DBEAFE', color: '#1E40AF' },
    { label: 'Offres publiées', value: stats.totaux.offresPubliees, icon: Briefcase, bg: '#FEF3C7', color: '#92400E' },
    { label: 'Candidatures', value: stats.totaux.candidatures, icon: FileText, bg: '#EDE9FE', color: '#6D28D9' },
    { label: 'En attente', value: enAttente, icon: Clock, bg: '#D1FAE5', color: '#065F46' },
  ];

  const usersParRole = stats.utilisateursParRole.map((r) => ({
    label: ROLE_LABELS[r.role] || r.role,
    value: r.count,
    color: ROLE_COLORS[r.role] || '#94A3B8',
  }));
  const maxValue = Math.max(1, ...usersParRole.map((r) => r.value));

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
            {usersParRole.map((role) => (
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
          {activite.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune activité récente</p>
          ) : (
            <div className="space-y-4">
              {activite.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: COLORS.midnight }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-gray-900">{item.titre}</p>
                    <p className="truncate text-sm text-gray-500">{item.description}</p>
                  </div>
                  <span className="shrink-0 text-xs text-gray-400">{ilYA(item.date)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
