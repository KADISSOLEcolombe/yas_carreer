'use client';

import { Building2, Users, Briefcase, FileText, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import AdminDashboardHeader from '../../../components/admin/AdminDashboardHeader';

const COLORS = {
  midnight: '#1e3a8a',
  sky: '#5F99D2',
  yellow: '#facc15',
  green: '#10b981',
  red: '#ef4444',
  orange: '#f97316',
};

const OFFRES_PAR_DEPARTEMENT = [
  { departement: 'Informatique', offres: 12 },
  { departement: 'Marketing', offres: 8 },
  { departement: 'Comptabilité', offres: 6 },
  { departement: 'Commercial', offres: 15 },
  { departement: 'Ressources Humaines', offres: 4 },
  { departement: 'Stratégie', offres: 5 },
];

const UTILISATEURS_PAR_ROLE = [
  { role: 'Candidats', nombre: 156, color: COLORS.sky },
  { role: 'RH', nombre: 8, color: COLORS.midnight },
  { role: 'Admins', nombre: 3, color: COLORS.yellow },
  { role: 'Superviseurs', nombre: 5, color: COLORS.green },
];

const CANDIDATURES_PAR_STATUT = [
  { statut: 'En attente', nombre: 45, color: COLORS.orange },
  { statut: 'En cours', nombre: 32, color: COLORS.sky },
  { statut: 'Entretien', nombre: 28, color: COLORS.midnight },
  { statut: 'Acceptées', nombre: 38, color: COLORS.green },
  { statut: 'Refusées', nombre: 13, color: COLORS.red },
];

const STATS_CARDS = [
  { label: 'Total utilisateurs', value: 172, icon: Users, color: COLORS.midnight, trend: '+12%' },
  { label: 'Total candidatures', value: 156, icon: FileText, color: COLORS.sky, trend: '+8%' },
  { label: 'Offres actives', value: 50, icon: Briefcase, color: COLORS.green, trend: '+5%' },
  { label: 'Taux de conversion', value: '24%', icon: TrendingUp, color: COLORS.yellow, trend: '+3%' },
];

function StatCard({ label, value, icon: Icon, color, trend }: { label: string; value: string | number; icon: React.ElementType; color: string; trend: string }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          <p className="mt-1 text-sm font-medium" style={{ color: COLORS.green }}>{trend}</p>
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
  const maxOffres = Math.max(...OFFRES_PAR_DEPARTEMENT.map((d) => d.offres));

  return (
    <div className="space-y-6">
      <AdminDashboardHeader />

      {/* Cartes de statistiques générales */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS_CARDS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Graphiques en ligne */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Répartition des utilisateurs par rôle */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-gray-900">Répartition des utilisateurs par rôle</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={UTILISATEURS_PAR_ROLE}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="nombre"
                  label={({ role, nombre }) => `${role}: ${nombre}`}
                  labelLine={false}
                >
                  {UTILISATEURS_PAR_ROLE.map((entry, index) => (
                    <Cell key={entry.role} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Statut des candidatures */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-gray-900">Statut des candidatures</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CANDIDATURES_PAR_STATUT} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="statut" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#F3F4F6' }} />
                <Bar dataKey="nombre" name="Candidatures" radius={[6, 6, 0, 0]}>
                  {CANDIDATURES_PAR_STATUT.map((entry) => (
                    <Cell key={entry.statut} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Offres par département — graphique en barres horizontales */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-bold text-gray-900">Offres par département</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={OFFRES_PAR_DEPARTEMENT} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
              <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="departement"
                width={130}
                tick={{ fill: '#374151', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip cursor={{ fill: '#F3F4F6' }} />
              <Bar dataKey="offres" name="Offres" radius={[0, 6, 6, 0]}>
                {OFFRES_PAR_DEPARTEMENT.map((entry, index) => (
                  <Cell key={entry.departement} fill={index % 2 === 0 ? COLORS.midnight : COLORS.sky} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Répartition des offres — liste avec barres de progression */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-bold text-gray-900">Répartition des offres</h2>
        <div className="space-y-1">
          {OFFRES_PAR_DEPARTEMENT.map((dep) => (
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
                  style={{ width: `${(dep.offres / maxOffres) * 100}%`, backgroundColor: COLORS.midnight }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-sm font-semibold text-gray-900">{dep.offres}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
