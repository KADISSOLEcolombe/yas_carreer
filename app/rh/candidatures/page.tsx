'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CircleCheck, CircleX, Filter, Download } from 'lucide-react';
import RhDashboardHeader from '../../../components/rh/RhDashboardHeader';

const COLORS = {
  midnight: '#1e3a8a',
};

type ContractType = 'CDI' | 'CDD' | 'Stage';
type CandidatureStatus = 'ENTRETIEN' | 'EN_COURS' | 'EN_ATTENTE' | 'ACCEPTE' | 'REFUSE';

interface Candidature {
  id: number;
  nom: string;
  poste: string;
  date: string;
  type: ContractType;
  status: CandidatureStatus;
}

const TYPE_BADGE: Record<ContractType, { bg: string; text: string }> = {
  CDI: { bg: COLORS.midnight, text: '#FFFFFF' },
  CDD: { bg: '#F6A800', text: '#FFFFFF' },
  Stage: { bg: '#5F99D2', text: '#FFFFFF' },
};

const STATUS_STYLES: Record<CandidatureStatus, { bg: string; text: string; label: string }> = {
  ENTRETIEN: { bg: '#EDE9FE', text: '#6D28D9', label: 'Entretien planifié' },
  EN_COURS: { bg: '#DBEAFE', text: '#1E40AF', label: 'En cours' },
  EN_ATTENTE: { bg: '#FEF3C7', text: '#92400E', label: 'En attente' },
  ACCEPTE: { bg: '#D1FAE5', text: '#065F46', label: 'Accepté' },
  REFUSE: { bg: '#FEE2E2', text: '#DC2626', label: 'Refusé' },
};

// Données d'exemple en dur — à remplacer par un appel API plus tard
const MOCK_CANDIDATURES: Candidature[] = [
  { id: 1, nom: 'Kodjo Mensah', poste: 'Développeur Full Stack', date: '14/01/2025', type: 'CDI', status: 'ENTRETIEN' },
  { id: 2, nom: 'Akossiwa Gnammi', poste: 'Stage – Analyste Business', date: '12/01/2025', type: 'Stage', status: 'EN_COURS' },
  { id: 3, nom: 'Yao Agbemadon', poste: 'Chargé(e) de Communication', date: '13/01/2025', type: 'CDI', status: 'EN_ATTENTE' },
  { id: 4, nom: 'Afi Dzivaguru', poste: 'Commercial Terrain', date: '11/01/2025', type: 'CDD', status: 'ACCEPTE' },
  { id: 5, nom: 'Kwame Tossou', poste: 'Stage – Designer UX/UI', date: '15/01/2025', type: 'Stage', status: 'REFUSE' },
  { id: 6, nom: 'Dodzi Kpadenou', poste: 'Responsable Comptable', date: '14/01/2025', type: 'CDI', status: 'EN_ATTENTE' },
];

function TypeBadge({ type }: { type: ContractType }) {
  const style = TYPE_BADGE[type];
  return (
    <span className="inline-flex rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: style.bg, color: style.text }}>
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: CandidatureStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: style.bg, color: style.text }}>
      {style.label}
    </span>
  );
}

export default function RHCandidaturesPage() {
  const [candidatures, setCandidatures] = useState<Candidature[]>(MOCK_CANDIDATURES);

  const handleAccept = (id: number) => {
    setCandidatures((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'ACCEPTE' } : c)));
  };

  const handleReject = (id: number) => {
    setCandidatures((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'REFUSE' } : c)));
  };

  return (
    <div className="space-y-6">
      <RhDashboardHeader />

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <h2 className="text-lg font-bold text-gray-900">Toutes les candidatures ({candidatures.length})</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Filtres à venir.')}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
            >
              <Filter size={15} />
              Filtrer
            </button>
            <button
              onClick={() => alert('Export à venir.')}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
            >
              <Download size={15} />
              Exporter
            </button>
          </div>
        </div>

        <div className="px-6">
          {candidatures.map((c) => (
            <Link
              key={c.id}
              href={`/rh/candidatures/${c.id}`}
              className="flex items-center justify-between gap-4 border-b border-gray-100 py-4 last:border-b-0 transition-colors hover:bg-gray-50"
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
                  <p className="truncate text-sm text-gray-500">
                    {c.poste} · {c.date}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <TypeBadge type={c.type} />
                <StatusBadge status={c.status} />
                <button
                  onClick={(e) => e.preventDefault()}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-green-50 hover:text-green-600"
                  title="Accepter"
                >
                  <CircleCheck size={16} />
                </button>
                <button
                  onClick={(e) => e.preventDefault()}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  title="Refuser"
                >
                  <CircleX size={16} />
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
