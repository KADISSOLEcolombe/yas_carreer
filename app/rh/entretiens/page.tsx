'use client';

import { useState } from 'react';
import { Calendar, Plus } from 'lucide-react';
import RhDashboardHeader from '../../../components/rh/RhDashboardHeader';

const COLORS = {
  midnight: '#1e3a8a',
};

type EntretienType = 'Présentiel' | 'Visio';
type EntretienStatus = 'PLANIFIE' | 'TERMINE' | 'ANNULE';

interface Entretien {
  id: number;
  candidat: string;
  poste: string;
  date: string;
  heure: string;
  avec: string;
  type: EntretienType;
  statut: EntretienStatus;
}

const TYPE_BADGE: Record<EntretienType, { bg: string; text: string }> = {
  Présentiel: { bg: '#D1FAE5', text: '#065F46' },
  Visio: { bg: '#DBEAFE', text: '#1E40AF' },
};

const STATUS_BADGE: Record<EntretienStatus, { bg: string; text: string; label: string }> = {
  PLANIFIE: { bg: '#FEF3C7', text: '#92400E', label: 'Planifié' },
  TERMINE: { bg: '#D1FAE5', text: '#065F46', label: 'Terminé' },
  ANNULE: { bg: '#FEE2E2', text: '#DC2626', label: 'Annulé' },
};

const ICON_STYLE: Record<EntretienStatus, { bg: string; color: string }> = {
  PLANIFIE: { bg: '#E2E8F0', color: COLORS.midnight },
  TERMINE: { bg: '#D1FAE5', color: '#065F46' },
  ANNULE: { bg: '#FEE2E2', color: '#DC2626' },
};

// Données d'exemple en dur — à remplacer par un appel API plus tard
const MOCK_ENTRETIENS: Entretien[] = [
  { id: 1, candidat: 'Kodjo Mensah', poste: 'Développeur Full Stack', date: '21/01/2025', heure: '10:00', avec: 'Marie Dupont', type: 'Présentiel', statut: 'PLANIFIE' },
  { id: 2, candidat: 'Akossiwa Gnammi', poste: 'Stage – Analyste Business', date: '22/01/2025', heure: '14:30', avec: 'Jean Agbo', type: 'Visio', statut: 'PLANIFIE' },
  { id: 3, candidat: 'Yao Agbemadon', poste: 'Chargé(e) de Communication', date: '19/01/2025', heure: '09:00', avec: 'Marie Dupont', type: 'Visio', statut: 'TERMINE' },
];

function TypeBadge({ type }: { type: EntretienType }) {
  const style = TYPE_BADGE[type];
  return (
    <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: style.bg, color: style.text }}>
      {type}
    </span>
  );
}

function StatusBadge({ statut }: { statut: EntretienStatus }) {
  const style = STATUS_BADGE[statut];
  return (
    <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: style.bg, color: style.text }}>
      {style.label}
    </span>
  );
}

export default function RHEntretiensPage() {
  const [entretiens] = useState<Entretien[]>(MOCK_ENTRETIENS);

  const handlePlanifier = () => {
    alert("Formulaire de planification d'entretien à venir.");
  };

  return (
    <div className="space-y-6">
      <RhDashboardHeader />

      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold" style={{ color: COLORS.midnight }}>
          Entretiens planifiés
        </h2>
        <button
          onClick={handlePlanifier}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: COLORS.midnight }}
        >
          <Plus size={16} />
          Planifier
        </button>
      </div>

      <div className="space-y-4">
        {entretiens.map((entretien) => {
          const iconStyle = ICON_STYLE[entretien.statut];
          return (
            <div
              key={entretien.id}
              className="flex items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: iconStyle.bg, color: iconStyle.color }}
                >
                  <Calendar size={18} />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-bold text-gray-900">{entretien.candidat}</p>
                  <p className="truncate text-sm text-gray-500">{entretien.poste}</p>
                  <p className="truncate text-sm text-gray-500">
                    {entretien.date} à {entretien.heure} · {entretien.avec}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <TypeBadge type={entretien.type} />
                <StatusBadge statut={entretien.statut} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
