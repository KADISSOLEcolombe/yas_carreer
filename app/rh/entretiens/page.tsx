'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Plus, X } from 'lucide-react';
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

// Candidats disponibles pour la planification
const MOCK_CANDIDATS = [
  { id: 1, nom: 'Kodjo Mensah', poste: 'Développeur Full Stack', email: 'kodjo.mensah@email.com', telephone: '+228 90 11 22 33' },
  { id: 2, nom: 'Akossiwa Gnammi', poste: 'Stage – Analyste Business', email: 'akossiwa.gnammi@email.com', telephone: '+228 91 22 33 44' },
  { id: 3, nom: 'Yao Agbemadon', poste: 'Chargé(e) de Communication', email: 'yao.agbemadon@email.com', telephone: '+228 92 33 44 55' },
  { id: 4, nom: 'Afi Dzivaguru', poste: 'Commercial Terrain', email: 'afi.dzivaguru@email.com', telephone: '+228 93 44 55 66' },
];

const EMPTY_FORM = {
  candidatId: '',
  date: '',
  heure: '',
  duree: '1h',
  type: 'Présentiel' as EntretienType,
  avec: 'Marie Dupont',
  notes: '',
  lienVisio: '',
  adresse: 'Bureau YAS Togo, Lomé',
};

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
  const [entretiens, setEntretiens] = useState<Entretien[]>(MOCK_ENTRETIENS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenModal = () => {
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const candidat = MOCK_CANDIDATS.find((c) => c.id === Number(form.candidatId));
    if (!candidat) return;

    const newEntretien: Entretien = {
      id: entretiens.length + 1,
      candidat: candidat.nom,
      poste: candidat.poste,
      date: new Date(form.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      heure: form.heure,
      avec: form.avec,
      type: form.type,
      statut: 'PLANIFIE',
    };

    setEntretiens([...entretiens, newEntretien]);
    setIsSubmitting(false);
    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      <RhDashboardHeader />

      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold" style={{ color: COLORS.midnight }}>
          Entretiens planifiés
        </h2>
        <button
          onClick={handleOpenModal}
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
            <Link
              key={entretien.id}
              href={`/rh/entretiens/${entretien.id}`}
              className="flex items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm transition-colors hover:bg-gray-50"
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
            </Link>
          );
        })}
      </div>

      {/* Modale de planification d'entretien */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Planifier un entretien</h2>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Candidat *</label>
                <select
                  required
                  value={form.candidatId}
                  onChange={(e) => setForm({ ...form, candidatId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                >
                  <option value="">Sélectionner un candidat</option>
                  {MOCK_CANDIDATS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom} - {c.poste}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Date *</label>
                  <input
                    required
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Heure *</label>
                  <input
                    required
                    type="time"
                    value={form.heure}
                    onChange={(e) => setForm({ ...form, heure: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Durée</label>
                  <select
                    value={form.duree}
                    onChange={(e) => setForm({ ...form, duree: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                  >
                    <option value="30min">30 minutes</option>
                    <option value="45min">45 minutes</option>
                    <option value="1h">1 heure</option>
                    <option value="1h30">1h30</option>
                    <option value="2h">2 heures</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Type d'entretien</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as EntretienType })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                  >
                    <option value="Présentiel">Présentiel</option>
                    <option value="Visio">Visio</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Entretien avec</label>
                <input
                  value={form.avec}
                  onChange={(e) => setForm({ ...form, avec: e.target.value })}
                  placeholder="Ex: Marie Dupont"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                />
              </div>

              {form.type === 'Visio' && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Lien de visioconférence</label>
                  <input
                    value={form.lienVisio}
                    onChange={(e) => setForm({ ...form, lienVisio: e.target.value })}
                    placeholder="Ex: https://meet.google.com/abc-defg-hij"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                  />
                </div>
              )}

              {form.type === 'Présentiel' && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Adresse</label>
                  <input
                    value={form.adresse}
                    onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                    placeholder="Ex: Bureau YAS Togo, Lomé"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Notes sur l'entretien..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-lg px-4 py-2 text-sm font-bold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                  style={{ backgroundColor: COLORS.midnight }}
                >
                  {isSubmitting ? 'Planification...' : 'Planifier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
