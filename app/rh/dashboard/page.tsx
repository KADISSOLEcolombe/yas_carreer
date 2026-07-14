'use client';

import Link from 'next/link';
import { Briefcase, FileText, Calendar, UserCheck } from 'lucide-react';
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

const COLORS = {
  midnight: '#1e3a8a',
  yellow: '#facc15',
  sky: '#5F99D2',
};

// Données d'exemple en dur — à remplacer par un appel API plus tard
const STAT_CARDS = [
  { label: 'Offres actives', value: 6, icon: Briefcase, bg: '#DBEAFE', color: '#1E40AF' },
  { label: 'Candidatures', value: 6, icon: FileText, bg: '#FEF3C7', color: '#92400E' },
  { label: 'Entretiens planifiés', value: 2, icon: Calendar, bg: '#EDE9FE', color: '#6D28D9' },
  { label: 'Recrutements', value: 1, icon: UserCheck, bg: '#D1FAE5', color: '#065F46' },
];

const CANDIDATURES_PAR_MOIS = [
  { mois: 'Sep', total: 15 },
  { mois: 'Oct', total: 22 },
  { mois: 'Nov', total: 32 },
  { mois: 'Déc', total: 26 },
  { mois: 'Jan', total: 38 },
];

const REPARTITION_CONTRAT = [
  { name: 'CDI', value: 45, color: COLORS.midnight },
  { name: 'CDD', value: 20, color: COLORS.yellow },
  { name: 'Stage', value: 35, color: COLORS.sky },
];

type CandidatureStatus = 'ENTRETIEN' | 'EN_COURS' | 'EN_ATTENTE' | 'ACCEPTE';

const STATUS_STYLES: Record<CandidatureStatus, { bg: string; text: string; label: string }> = {
  ENTRETIEN: { bg: '#EDE9FE', text: '#6D28D9', label: 'Entretien planifié' },
  EN_COURS: { bg: '#DBEAFE', text: '#1E40AF', label: 'En cours' },
  EN_ATTENTE: { bg: '#FEF3C7', text: '#92400E', label: 'En attente' },
  ACCEPTE: { bg: '#D1FAE5', text: '#065F46', label: 'Accepté' },
};

const CANDIDATURES_RECENTES: { id: number; nom: string; poste: string; status: CandidatureStatus }[] = [
  { id: 1, nom: 'Kodjo Mensah', poste: 'Développeur Full Stack', status: 'ENTRETIEN' },
  { id: 2, nom: 'Akossiwa Gnammi', poste: 'Stage – Analyste Business', status: 'EN_COURS' },
  { id: 3, nom: 'Yao Agbemadon', poste: 'Chargé(e) de Communication', status: 'EN_ATTENTE' },
  { id: 4, nom: 'Afi Dzivaguru', poste: 'Commercial Terrain', status: 'ACCEPTE' },
];

export default function RHDashboardPage() {
  return (
    <div className="space-y-6">
      <RhDashboardHeader />

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
              <BarChart data={CANDIDATURES_PAR_MOIS}>
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
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={REPARTITION_CONTRAT}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {REPARTITION_CONTRAT.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" iconType="square" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Candidatures récentes */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <h2 className="border-b border-gray-100 px-6 py-5 text-lg font-bold text-gray-900">Candidatures récentes</h2>
        <div className="px-6">
          {CANDIDATURES_RECENTES.map((c) => {
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
                    <p className="truncate text-sm text-gray-500">{c.poste}</p>
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
          })}
        </div>
      </div>
    </div>
  );
}
