'use client';

import { useEffect, useState } from 'react';
import { Building2, Users, Briefcase, FileText, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import AdminDashboardHeader from '../../../components/admin/AdminDashboardHeader';
import { api } from '../../../lib/api';

const COLORS = {
  midnight: '#00377D',
  sky: '#5F99D2',
  yellow: '#FFD100',
  green: '#10b981',
  red: '#ef4444',
  orange: '#f97316',
};

const ROLE_LABELS: Record<string, string> = {
  Candidat: 'Candidats',
  RH: 'RH',
  Superviseur: 'Superviseurs',
  Administrateur: 'Admins',
  'Responsable RH': 'Resp. RH',
};

const ROLE_COLORS: Record<string, string> = {
  Candidat: COLORS.sky,
  RH: COLORS.midnight,
  Administrateur: COLORS.yellow,
  Superviseur: COLORS.green,
  'Responsable RH': COLORS.orange,
};

const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  ACCEPTEE: 'Acceptées',
  REJETEE: 'Refusées',
};

const STATUT_COLORS: Record<string, string> = {
  EN_ATTENTE: COLORS.orange,
  ACCEPTEE: COLORS.green,
  REJETEE: COLORS.red,
};

interface AdminStats {
  totaux: { utilisateurs: number; offres: number; offresPubliees: number; candidatures: number };
  utilisateursParRole: Array<{ role: string; count: number }>;
  candidaturesParStatut: Array<{ statut: string; count: number }>;
  offresParDepartement: Array<{ departement: string; count: number }>;
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}33` }}
        >
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </div>
  );
}

export default function AdminStatistiquesPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getAdminStats()
      .then(setStats)
      .catch((err) => {
        console.error('Erreur chargement statistiques admin:', err);
        setError(err.message || 'Impossible de charger les statistiques');
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminDashboardHeader />
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: COLORS.midnight }} />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="space-y-6">
        <AdminDashboardHeader />
        <p className="text-center text-red-600 py-16">{error || 'Impossible de charger les statistiques'}</p>
      </div>
    );
  }

  const utilisateursData = stats.utilisateursParRole.map((r) => ({
    role: ROLE_LABELS[r.role] || r.role,
    nombre: r.count,
    color: ROLE_COLORS[r.role] || '#94A3B8',
  }));

  const candidaturesData = stats.candidaturesParStatut.map((c) => ({
    statut: STATUT_LABELS[c.statut] || c.statut,
    nombre: c.count,
    color: STATUT_COLORS[c.statut] || '#94A3B8',
  }));

  const offresData = stats.offresParDepartement;
  const maxOffres = Math.max(1, ...offresData.map((d) => d.count));

  const totalCandidaturesTraitees = candidaturesData.reduce((sum, c) => sum + c.nombre, 0);
  const accepteesCount = stats.candidaturesParStatut.find((c) => c.statut === 'ACCEPTEE')?.count || 0;
  const tauxConversion = totalCandidaturesTraitees > 0 ? Math.round((accepteesCount / totalCandidaturesTraitees) * 100) : 0;

  const STATS_CARDS = [
    { label: 'Total utilisateurs', value: stats.totaux.utilisateurs, icon: Users, color: COLORS.midnight },
    { label: 'Total candidatures', value: stats.totaux.candidatures, icon: FileText, color: COLORS.sky },
    { label: 'Offres publiées', value: stats.totaux.offresPubliees, icon: Briefcase, color: COLORS.green },
    { label: 'Taux d\'acceptation', value: `${tauxConversion}%`, icon: TrendingUp, color: COLORS.yellow },
  ];

  return (
    <div className="space-y-6">
      <AdminDashboardHeader />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS_CARDS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-gray-900">Répartition des utilisateurs par rôle</h2>
          <div className="h-72">
            {utilisateursData.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-gray-500">Aucune donnée</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={utilisateursData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="nombre"
                    label={(entry: any) => `${entry.role}: ${entry.nombre}`}
                    labelLine={false}
                  >
                    {utilisateursData.map((entry) => (
                      <Cell key={entry.role} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-gray-900">Statut des candidatures</h2>
          <div className="h-72">
            {candidaturesData.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-gray-500">Aucune donnée</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={candidaturesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="statut" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#F3F4F6' }} />
                  <Bar dataKey="nombre" name="Candidatures" radius={[6, 6, 0, 0]}>
                    {candidaturesData.map((entry) => (
                      <Cell key={entry.statut} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-bold text-gray-900">Offres par département</h2>
        <div className="h-72">
          {offresData.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-gray-500">Aucune offre</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={offresData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="departement"
                  width={130}
                  tick={{ fill: '#374151', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip cursor={{ fill: '#F3F4F6' }} />
                <Bar dataKey="count" name="Offres" radius={[0, 6, 6, 0]}>
                  {offresData.map((entry, index) => (
                    <Cell key={entry.departement} fill={index % 2 === 0 ? COLORS.midnight : COLORS.sky} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-bold text-gray-900">Répartition des offres</h2>
        <div className="space-y-1">
          {offresData.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune offre</p>
          ) : (
            offresData.map((dep) => (
              <div key={dep.departement} className="flex items-center gap-4 py-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50"
                  style={{ color: COLORS.midnight }}
                >
                  <Building2 size={16} />
                </div>
                <span className="w-40 shrink-0 truncate text-sm font-medium text-gray-800">{dep.departement}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(dep.count / maxOffres) * 100}%`, backgroundColor: COLORS.midnight }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-sm font-semibold text-gray-900">{dep.count}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
