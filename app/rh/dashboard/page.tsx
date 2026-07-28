'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, FileText, Calendar, UserCheck, Eye } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import RhDashboardHeader from '../../../components/rh/RhDashboardHeader';
import { api, mapCandidature, type Application, type RhStats } from '../../../lib/api';

const MOIS_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

function candidaturesParMois(applications: Application[]) {
  // Les 5 derniers mois, y compris ceux sans aucune candidature
  const mois: { mois: string; total: number }[] = [];
  const now = new Date();
  for (let i = 4; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    mois.push({ mois: MOIS_LABELS[d.getMonth()], total: 0 });
  }
  applications.forEach((a) => {
    const d = new Date(a.createdAt);
    const diffMois = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    if (diffMois >= 0 && diffMois <= 4) {
      mois[4 - diffMois].total += 1;
    }
  });
  return mois;
}

function repartitionParContrat(offres: { type: string }[]) {
  const couleurs: Record<string, string> = { CDI: COLORS.midnight, CDD: COLORS.yellow, Stage: COLORS.sky };
  const compteur = new Map<string, number>();
  offres.forEach((o) => compteur.set(o.type, (compteur.get(o.type) || 0) + 1));
  return Array.from(compteur.entries()).map(([name, value]) => ({
    name,
    value,
    color: couleurs[name] || '#94A3B8',
  }));
}

const COLORS = {
  midnight: '#1e3a8a',
  yellow: '#facc15',
  sky: '#5F99D2',
};

const STATUS_STYLES: Record<Application['status'], { bg: string; text: string; label: string }> = {
  PENDING: { bg: '#FEF3C7', text: '#92400E', label: 'En attente' },
  IN_REVIEW: { bg: '#DBEAFE', text: '#1E40AF', label: 'En cours' },
  INTERVIEW: { bg: '#EDE9FE', text: '#6D28D9', label: 'Entretien planifié' },
  ACCEPTED: { bg: '#D1FAE5', text: '#065F46', label: 'Accepté' },
  REJECTED: { bg: '#FEE2E2', text: '#DC2626', label: 'Refusé' },
};

export default function RHDashboardPage() {
  const [stats, setStats] = useState<RhStats>({ offresCount: 0, candidaturesCount: 0, enAttenteCount: 0, candidatsCount: 0 });
  const [applications, setApplications] = useState<Application[]>([]);
  const [offres, setOffres] = useState<{ type: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [statsData, appsData, offresData] = await Promise.all([
          api.rhStats(),
          api.getAllApplications(),
          api.rhOffers(),
        ]);
        setStats(statsData);
        setApplications(appsData.map(mapCandidature));
        setOffres(offresData);
      } catch (err) {
        console.error('Erreur chargement dashboard RH:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const STAT_CARDS = [
    { label: 'Offres actives', value: stats.offresCount, icon: Briefcase, bg: '#DBEAFE', color: '#1E40AF' },
    { label: 'Candidatures', value: stats.candidaturesCount, icon: FileText, bg: '#FEF3C7', color: '#92400E' },
    { label: 'En attente', value: stats.enAttenteCount, icon: Calendar, bg: '#EDE9FE', color: '#6D28D9' },
    { label: 'Candidats', value: stats.candidatsCount, icon: UserCheck, bg: '#D1FAE5', color: '#065F46' },
  ];

  const dataCandidaturesParMois = candidaturesParMois(applications);
  const dataRepartitionContrat = repartitionParContrat(offres);

  const recentApplications = applications.slice(0, 5);

  return (
    <div className="space-y-6">
      <RhDashboardHeader />

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: COLORS.midnight }} />
        </div>
      ) : (
        <>
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

          {/* Graphiques */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-gray-900">Candidatures / mois</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataCandidaturesParMois}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="mois" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#F3F4F6' }} />
                    <Bar dataKey="total" fill={COLORS.midnight} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-gray-900">Répartition par contrat</h2>
              <div className="h-64">
                {dataRepartitionContrat.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-gray-500">
                    Aucune offre pour le moment
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dataRepartitionContrat}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                      >
                        {dataRepartitionContrat.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" iconType="square" />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Candidatures récentes */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <h2 className="border-b border-gray-100 px-6 py-5 text-lg font-bold text-gray-900">Candidatures récentes</h2>
            <div className="px-6">
              {recentApplications.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Aucune candidature récente</p>
              ) : (
                recentApplications.map((c) => {
                  const style = STATUS_STYLES[c.status];
                  return (
                    <div
                      key={c.id}
                      className="flex items-center justify-between gap-4 border-b border-gray-100 py-4 last:border-b-0"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                          style={{ backgroundColor: COLORS.midnight }}
                        >
                          {c.nom.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-bold text-gray-900">{c.nom}</p>
                          <p className="truncate text-sm text-gray-500">{c.jobTitle}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span
                          className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                          style={{ backgroundColor: style.bg, color: style.text }}
                        >
                          {style.label}
                        </span>
                        <Link
                          href="/rh/candidatures"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        >
                          <Eye size={16} />
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
