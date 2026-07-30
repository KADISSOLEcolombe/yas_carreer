'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import RhDashboardHeader from '../../../components/rh/RhDashboardHeader';
import InterviewCalendar from '../../../components/InterviewCalendar';
import { api, type ApiCandidature } from '../../../lib/api';
import type { Interview } from '../../../lib/interviews';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = {
  midnight: '#00377D',
};

type EntretienType = 'presentiel' | 'visio';
type EntretienStatus = 'PLANIFIE' | 'TERMINE' | 'ANNULE';

interface ApiEntretien {
  id: number;
  date: string;
  type: EntretienType;
  statut: EntretienStatus;
  commentaire: string | null;
  lien_meeting: string | null;
  plateforme: string | null;
  duree: number | null;
  candidature: {
    id: number;
    utilisateur: {
      id: number;
      nom: string;
      prenom: string;
      email: string;
    };
    offre: {
      id: number;
      titre: string;
    };
  };
  utilisateur_entretien_utilisateurrh_idToutilisateur: {
    id: number;
    nom: string;
    prenom: string;
  };
  utilisateur_entretien_utilisateursup_idToutilisateur?: {
    id: number;
    nom: string;
    prenom: string;
  };
}

interface Entretien {
  id: number;
  candidat: string;
  poste: string;
  date: string;
  heure: string;
  dateTime: string;
  avec: string;
  type: EntretienType;
  statut: EntretienStatus;
  lien_meeting?: string;
  plateforme?: string;
  duree?: number;
}

const TYPE_BADGE: Record<EntretienType, { bg: string; text: string }> = {
  presentiel: { bg: '#D1FAE5', text: '#065F46' },
  visio: { bg: '#DBEAFE', text: '#1E40AF' },
};

const STATUS_BADGE: Record<EntretienStatus, { bg: string; text: string; label: string }> = {
  PLANIFIE: { bg: '#FEF3C7', text: '#92400E', label: 'Planifié' },
  TERMINE: { bg: '#D1FAE5', text: '#065F46', label: 'Terminé' },
  ANNULE: { bg: '#FEE2E2', text: '#DC2626', label: 'Annulé' },
};

const ICON_STYLE: Record<string, { bg: string; color: string }> = {
  PLANIFIE: { bg: '#E2E8F0', color: COLORS.midnight },
  TERMINE: { bg: '#D1FAE5', color: '#065F46' },
  ANNULE: { bg: '#FEE2E2', color: '#DC2626' },
};

const EMPTY_FORM = {
  candidatId: '',
  date: '',
  heure: '',
  duree: '60',
  type: 'presentiel' as EntretienType,
  plateforme: 'Jitsi Meet',
  notes: '',
  lienVisio: '',
};

// Génère un lien de visioconférence Jitsi Meet (gratuit, aucun compte requis)
function genererLienJitsi(): string {
  const suffixe = Math.random().toString(36).slice(2, 8);
  return `https://meet.jit.si/YASTogo-Entretien-${Date.now()}-${suffixe}`;
}

function mapApiEntretien(apiEntretien: ApiEntretien): Entretien {
  const dateObj = new Date(apiEntretien.date);
  const date = dateObj.toLocaleDateString('fr-FR');
  const heure = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const avec = apiEntretien.utilisateur_entretien_utilisateurrh_idToutilisateur
    ? `${apiEntretien.utilisateur_entretien_utilisateurrh_idToutilisateur.prenom} ${apiEntretien.utilisateur_entretien_utilisateurrh_idToutilisateur.nom}`
    : 'Non assigné';

  return {
    id: apiEntretien.id,
    candidat: `${apiEntretien.candidature.utilisateur.prenom} ${apiEntretien.candidature.utilisateur.nom}`,
    poste: apiEntretien.candidature.offre.titre,
    date,
    heure,
    dateTime: apiEntretien.date,
    avec,
    type: apiEntretien.type,
    statut: apiEntretien.statut,
    lien_meeting: apiEntretien.lien_meeting || undefined,
    plateforme: apiEntretien.plateforme || undefined,
    duree: apiEntretien.duree || undefined,
  };
}

function TypeBadge({ type }: { type: EntretienType }) {
  const style = TYPE_BADGE[type] || { bg: '#E2E8F0', text: '#4B5563' };
  return (
    <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: style.bg, color: style.text }}>
      {type === 'presentiel' ? 'Présentiel' : type === 'visio' ? 'Visio' : type || 'Inconnu'}
    </span>
  );
}

function StatusBadge({ statut }: { statut: EntretienStatus }) {
  const style = STATUS_BADGE[statut] || { bg: '#E2E8F0', text: '#4B5563', label: statut || 'Inconnu' };
  return (
    <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: style.bg, color: style.text }}>
      {style.label}
    </span>
  );
}

export default function RHEntretiensPage() {
  const router = useRouter();
  const [entretiens, setEntretiens] = useState<Entretien[]>([]);
  const [candidatures, setCandidatures] = useState<ApiCandidature[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const calendarInterviews: Interview[] = useMemo(
    () =>
      entretiens.map((e) => ({
        id: String(e.id),
        applicationId: String(e.id),
        candidateName: e.candidat,
        candidateEmail: '',
        jobTitle: e.poste,
        dateTime: e.dateTime,
        location: e.type === 'visio' ? e.plateforme || 'Visio' : 'Présentiel',
        notes: '',
        status:
          e.statut === 'TERMINE'
            ? 'COMPLETED'
            : e.statut === 'ANNULE'
              ? 'CANCELLED'
              : 'SCHEDULED',
        createdAt: e.dateTime,
      })),
    [entretiens]
  );

  useEffect(() => {
    const loadEntretiens = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const apiData = await api.getEntretiens();
        const mappedData = apiData.map(mapApiEntretien);
        setEntretiens(mappedData);
      } catch (err: any) {
        console.error('Erreur lors du chargement des entretiens:', err);
        setError(err.message || 'Impossible de charger les entretiens');
      } finally {
        setIsLoading(false);
      }
    };

    const loadCandidatures = async () => {
      try {
        const data = await api.getAllApplications();
        setCandidatures(data);
      } catch (err) {
        console.error('Erreur lors du chargement des candidatures:', err);
      }
    };

    loadEntretiens();
    loadCandidatures();
  }, []);

  const handleOpenModal = () => {
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Combiner date et heure pour créer un datetime complet
      const dateTime = new Date(`${form.date}T${form.heure}`);
      
      const data = {
        date: dateTime.toISOString(),
        type: form.type,
        statut: 'PLANIFIE',
        commentaire: form.notes || undefined,
        id_candidature: Number(form.candidatId),
        lien_meeting: form.type === 'visio' ? form.lienVisio : undefined,
        plateforme: form.type === 'visio' ? form.plateforme : undefined,
        duree: form.type === 'visio' ? parseInt(form.duree) : undefined,
      };

      await api.createEntretien(data);
      
      // Recharger la liste
      const apiData = await api.getEntretiens();
      const mappedData = apiData.map(mapApiEntretien);
      setEntretiens(mappedData);
      toast.success('Entretien planifié — un e-mail a été envoyé au candidat');
      
      setIsSubmitting(false);
      handleCloseModal();
    } catch (err: any) {
      console.error('Erreur lors de la création:', err);
      alert(err.message || 'Erreur lors de la création');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <RhDashboardHeader />

      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-yas-midnight">
          Entretiens planifiés
        </h2>
        <Button onClick={handleOpenModal} className="gap-2 font-bold" variant="secondary">
          <Plus size={16} />
          Planifier
        </Button>
      </div>

      {!isLoading && !error && (
        <Card>
          <CardHeader>
            <CardTitle className="text-yas-midnight">Calendrier des entretiens</CardTitle>
          </CardHeader>
          <CardContent>
            <InterviewCalendar
              interviews={calendarInterviews}
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              onMonthChange={setCurrentMonth}
              onSelectDate={setSelectedDate}
              onSelectInterview={(interview) => router.push(`/rh/entretiens/${interview.id}`)}
            />
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-400" />
          </div>
        ) : error ? (
          <p className="text-center text-red-600 py-12">{error}</p>
        ) : entretiens.length === 0 ? (
          <p className="text-center text-gray-500 py-12">Aucun entretien planifié</p>
        ) : (
          entretiens.map((entretien) => {
            const iconStyle = ICON_STYLE[entretien.statut] || { bg: '#E2E8F0', color: COLORS.midnight };
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
          })
        )}
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
                <label className="mb-2 block text-sm font-medium text-gray-700">Candidature *</label>
                <select
                  required
                  value={form.candidatId}
                  onChange={(e) => setForm({ ...form, candidatId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00377D] focus:border-transparent"
                >
                  <option value="">Sélectionner une candidature</option>
                  {candidatures.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.utilisateur?.prenom} {c.utilisateur?.nom} - {c.offre?.titre}
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
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00377D] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Heure *</label>
                  <input
                    required
                    type="time"
                    value={form.heure}
                    onChange={(e) => setForm({ ...form, heure: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00377D] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Durée</label>
                  <select
                    value={form.duree}
                    onChange={(e) => setForm({ ...form, duree: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00377D] focus:border-transparent"
                  >
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 heure</option>
                    <option value="90">1h30</option>
                    <option value="120">2 heures</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Type d'entretien</label>
                  <select
                    value={form.type}
                    onChange={(e) => {
                      const nouveauType = e.target.value as EntretienType;
                      // Génère automatiquement un lien Jitsi quand on passe en visio (si aucun lien n'est déjà saisi)
                      if (nouveauType === 'visio' && !form.lienVisio) {
                        setForm({ ...form, type: nouveauType, lienVisio: genererLienJitsi(), plateforme: 'Jitsi Meet' });
                      } else {
                        setForm({ ...form, type: nouveauType });
                      }
                    }}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00377D] focus:border-transparent"
                  >
                    <option value="presentiel">Présentiel</option>
                    <option value="visio">Visio</option>
                  </select>
                </div>
              </div>

              {form.type === 'visio' && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Plateforme</label>
                    <select
                      value={form.plateforme}
                      onChange={(e) => setForm({ ...form, plateforme: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00377D] focus:border-transparent"
                    >
                      <option value="Jitsi Meet">Jitsi Meet (généré automatiquement)</option>
                      <option value="Google Meet">Google Meet</option>
                      <option value="Zoom">Zoom</option>
                      <option value="Microsoft Teams">Microsoft Teams</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Lien de visioconférence *</label>
                    <div className="flex gap-2">
                      <input
                        required
                        value={form.lienVisio}
                        onChange={(e) => setForm({ ...form, lienVisio: e.target.value })}
                        placeholder="Ex: https://meet.google.com/abc-defg-hij"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00377D] focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, lienVisio: genererLienJitsi(), plateforme: 'Jitsi Meet' })}
                        title="Générer un nouveau lien Jitsi Meet"
                        className="shrink-0 rounded-lg border border-gray-300 px-3 text-sm text-gray-600 transition-colors hover:bg-gray-50"
                      >
                        ↻
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      Lien généré automatiquement (Jitsi Meet, gratuit, sans compte). Remplaçable par un lien Zoom/Google Meet si tu préfères.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Notes sur l'entretien..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00377D] focus:border-transparent"
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
