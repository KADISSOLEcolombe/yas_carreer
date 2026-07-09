'use client';

import { Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import AdminDashboardHeader from '../../../components/admin/AdminDashboardHeader';

const COLORS = {
  midnight: '#1e3a8a',
  sky: '#5F99D2',
};

const OFFRES_PAR_DEPARTEMENT = [
  { departement: 'Informatique', offres: 12 },
  { departement: 'Marketing', offres: 8 },
  { departement: 'Comptabilité', offres: 6 },
  { departement: 'Commercial', offres: 15 },
  { departement: 'Ressources Humaines', offres: 4 },
  { departement: 'Stratégie', offres: 5 },
];

export default function AdminStatistiquesPage() {
  const maxOffres = Math.max(...OFFRES_PAR_DEPARTEMENT.map((d) => d.offres));

  return (
    <div className="space-y-6">
      <AdminDashboardHeader />

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
