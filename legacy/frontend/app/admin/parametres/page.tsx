'use client';

import { useState } from 'react';
import AdminDashboardHeader from '../../../components/admin/AdminDashboardHeader';

const COLORS = {
  midnight: '#00377D',
};

interface Parametre {
  id: string;
  titre: string;
  description: string;
  actif: boolean;
}

// Données d'exemple en dur — à remplacer par un appel API plus tard
const PARAMETRES_INITIAUX: Parametre[] = [
  {
    id: 'notifications-email',
    titre: 'Notifications email',
    description: 'Alertes pour nouvelles candidatures et entretiens',
    actif: true,
  },
  {
    id: 'inscription-publique',
    titre: 'Inscription publique',
    description: 'Autoriser les visiteurs à créer un compte candidat',
    actif: true,
  },
  {
    id: 'moderation-offres',
    titre: 'Modération des offres',
    description: 'Validation manuelle avant publication',
    actif: false,
  },
  {
    id: 'rapport-hebdomadaire',
    titre: 'Rapport hebdomadaire',
    description: 'Envoi automatique du résumé RH chaque lundi',
    actif: true,
  },
];

function ToggleSwitch({ actif, onToggle }: { actif: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={actif}
      onClick={onToggle}
      className="relative h-7 w-12 shrink-0 rounded-full transition-colors"
      style={{ backgroundColor: actif ? COLORS.midnight : '#D1D5DB' }}
    >
      <span
        className="absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all"
        style={{ left: actif ? '1.625rem' : '0.25rem' }}
      />
    </button>
  );
}

export default function AdminParametresPage() {
  const [parametres, setParametres] = useState<Parametre[]>(PARAMETRES_INITIAUX);

  const handleToggle = (id: string) => {
    setParametres((prev) => prev.map((p) => (p.id === id ? { ...p, actif: !p.actif } : p)));
  };

  return (
    <div className="space-y-6">
      <AdminDashboardHeader />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {parametres.map((param) => (
          <div key={param.id} className="flex items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm">
            <div className="min-w-0">
              <p className="font-bold" style={{ color: COLORS.midnight }}>
                {param.titre}
              </p>
              <p className="mt-1 text-sm text-gray-500">{param.description}</p>
            </div>
            <ToggleSwitch actif={param.actif} onToggle={() => handleToggle(param.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}
