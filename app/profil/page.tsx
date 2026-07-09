'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Menu, AlertCircle, CheckCircle, XCircle, Calendar, Briefcase } from 'lucide-react';
import CandidateSidebar, { type CandidateTab } from '../../components/CandidateSidebar';

const COLORS = {
  midnight: '#1e3a8a',
  yellow: '#facc15',
  green: '#16a34a',
};

type CandidatureStatus = 'ENTRETIEN' | 'EN_COURS' | 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE';
type ContractType = 'CDI' | 'CDD' | 'Stage';

const STATUS_STYLES: Record<CandidatureStatus, { bg: string; text: string; label: string; icon: typeof Calendar }> = {
  ENTRETIEN: { bg: '#EDE9FE', text: '#6D28D9', label: 'Entretien planifié', icon: Calendar },
  EN_COURS: { bg: '#DBEAFE', text: '#1E40AF', label: 'En cours', icon: AlertCircle },
  EN_ATTENTE: { bg: '#FEF3C7', text: '#92400E', label: 'En attente', icon: AlertCircle },
  ACCEPTEE: { bg: '#D1FAE5', text: '#065F46', label: 'Acceptée', icon: CheckCircle },
  REFUSEE: { bg: '#FEE2E2', text: '#DC2626', label: 'Refusée', icon: XCircle },
};

const TYPE_BADGE: Record<ContractType, { bg: string; text: string }> = {
  CDI: { bg: COLORS.midnight, text: '#FFFFFF' },
  CDD: { bg: '#F6A800', text: '#FFFFFF' },
  Stage: { bg: '#5F99D2', text: '#FFFFFF' },
};

// Données d'exemple en dur — à remplacer par un appel API plus tard
const MOCK_CANDIDATURES: { id: number; poste: string; date: string; status: CandidatureStatus; type: ContractType }[] = [
  { id: 1, poste: 'Développeur Full Stack', date: '14/01/2025', status: 'ENTRETIEN', type: 'CDI' },
  { id: 2, poste: 'Stage – Analyste Business', date: '12/01/2025', status: 'EN_COURS', type: 'Stage' },
  { id: 3, poste: 'Chargé(e) de Communication', date: '13/01/2025', status: 'EN_ATTENTE', type: 'CDI' },
];

type EntretienType = 'Présentiel' | 'Visio';

const ENTRETIEN_TYPE_STYLES: Record<EntretienType, { bg: string; text: string }> = {
  Présentiel: { bg: '#D1FAE5', text: '#065F46' },
  Visio: { bg: '#DBEAFE', text: '#1E40AF' },
};

const MOCK_ENTRETIENS: { id: number; poste: string; date: string; heure: string; avec: string; type: EntretienType }[] = [
  { id: 1, poste: 'Développeur Full Stack', date: '21/01/2025', heure: '10:00', avec: 'Marie Dupont', type: 'Présentiel' },
  { id: 2, poste: 'Stage – Analyste Business', date: '22/01/2025', heure: '14:30', avec: 'Jean Agbo', type: 'Visio' },
];

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    titre: 'Entretien planifié',
    message: 'Un entretien a été planifié pour votre candidature « Développeur Full Stack ».',
    date: '15/01/2025',
  },
  {
    id: 2,
    titre: 'Candidature reçue',
    message: 'Votre candidature pour « Chargé(e) de Communication » a bien été reçue.',
    date: '13/01/2025',
  },
];

function StatusBadge({ status }: { status: CandidatureStatus }) {
  const style = STATUS_STYLES[status];
  const Icon = style.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      <Icon size={14} />
      {style.label}
    </span>
  );
}

function EntretienTypeBadge({ type }: { type: EntretienType }) {
  const style = ENTRETIEN_TYPE_STYLES[type];
  return (
    <span
      className="inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {type}
    </span>
  );
}

function TypeBadge({ type }: { type: ContractType }) {
  const style = TYPE_BADGE[type];
  return (
    <span
      className="inline-flex rounded-full px-3 py-1 text-xs font-bold"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {type}
    </span>
  );
}

function CandidatureRow({
  poste,
  date,
  status,
  type,
}: {
  poste: string;
  date: string;
  status: CandidatureStatus;
  type: ContractType;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 py-4 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100"
          style={{ color: COLORS.midnight }}
        >
          <Briefcase size={18} />
        </div>
        <div className="min-w-0">
          <p className="truncate font-bold text-gray-900">{poste}</p>
          <p className="text-sm text-gray-500">Postulé le {date}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <TypeBadge type={type} />
        <StatusBadge status={status} />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, isRecruiter } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<CandidateTab>('apercu');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/profil&message=auth_required');
    }
    if (!isLoading && isRecruiter) {
      router.push('/rh/dashboard');
    }
  }, [isAuthenticated, isLoading, isRecruiter, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div
          className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2"
          style={{ borderColor: COLORS.midnight }}
        />
      </div>
    );
  }

  const initial = user?.nom?.charAt(0).toUpperCase() || 'C';
  const stats = [
    { label: 'Candidatures', value: MOCK_CANDIDATURES.length, bg: COLORS.midnight, text: '#FFFFFF' },
    {
      label: 'Entretiens',
      value: MOCK_CANDIDATURES.filter((c) => c.status === 'ENTRETIEN').length,
      bg: COLORS.yellow,
      text: COLORS.midnight,
    },
    {
      label: 'Acceptées',
      value: MOCK_CANDIDATURES.filter((c) => c.status === 'ACCEPTEE').length,
      bg: COLORS.green,
      text: '#FFFFFF',
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CandidateSidebar
        activeTab={activeTab}
        onSelect={setActiveTab}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barre mobile */}
        <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600">
            <Menu size={22} />
          </button>
          <span className="font-semibold" style={{ color: COLORS.midnight }}>
            Espace candidat
          </span>
        </header>

        <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
          {/* En-tête */}
          <div
            className="flex flex-col gap-4 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between"
            style={{ backgroundColor: COLORS.midnight }}
          >
            <div className="flex items-center gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-bold"
                style={{ backgroundColor: COLORS.yellow, color: COLORS.midnight }}
              >
                {initial}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white sm:text-2xl">Bonjour, {user?.nom || 'Candidat'} 👋</h1>
                <p className="text-sm text-blue-100">Espace candidat · YAS TOGO</p>
              </div>
            </div>
            <Link
              href="/offres"
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl px-5 py-2.5 text-sm font-bold transition-opacity hover:opacity-90 sm:self-auto"
              style={{ backgroundColor: COLORS.yellow, color: COLORS.midnight }}
            >
              <Search size={16} />
              Voir les offres
            </Link>
          </div>

          {/* Contenu de l'onglet Aperçu */}
          {activeTab === 'apercu' && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl p-6 text-center shadow-sm"
                    style={{ backgroundColor: stat.bg }}
                  >
                    <p className="text-4xl font-extrabold" style={{ color: stat.text }}>
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm font-medium" style={{ color: stat.text }}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <h2 className="border-b border-gray-100 px-6 py-5 text-lg font-bold text-gray-900">
                  Dernières candidatures
                </h2>
                <div className="px-6">
                  {MOCK_CANDIDATURES.map((c) => (
                    <CandidatureRow key={c.id} poste={c.poste} date={c.date} status={c.status} type={c.type} />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Contenu de l'onglet Mes candidatures */}
          {activeTab === 'candidatures' && (
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <h2 className="border-b border-gray-100 px-6 py-5 text-lg font-bold text-gray-900">
                Mes candidatures ({MOCK_CANDIDATURES.length})
              </h2>
              <div className="px-6">
                {MOCK_CANDIDATURES.map((c) => (
                  <CandidatureRow key={c.id} poste={c.poste} date={c.date} status={c.status} type={c.type} />
                ))}
              </div>
            </div>
          )}

          {/* Contenu de l'onglet Mes entretiens */}
          {activeTab === 'entretiens' && (
            <div>
              <h2 className="mb-4 text-lg font-bold text-gray-900">Mes entretiens ({MOCK_ENTRETIENS.length})</h2>
              {MOCK_ENTRETIENS.length === 0 ? (
                <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
                  <p className="text-sm text-gray-500">Aucun entretien planifié pour le moment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {MOCK_ENTRETIENS.map((entretien) => (
                    <div
                      key={entretien.id}
                      className="flex items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100"
                          style={{ color: COLORS.midnight }}
                        >
                          <Calendar size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-bold text-gray-900">{entretien.poste}</p>
                          <p className="text-sm text-gray-500">
                            {entretien.date} à {entretien.heure}
                          </p>
                          <p className="text-sm text-gray-500">Avec {entretien.avec}</p>
                        </div>
                      </div>
                      <EntretienTypeBadge type={entretien.type} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Contenu de l'onglet Notifications */}
          {activeTab === 'notifications' && (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-gray-900">Notifications</h2>
              <div className="space-y-3">
                {MOCK_NOTIFICATIONS.map((n) => (
                  <div key={n.id} className="rounded-xl bg-gray-50 px-5 py-4">
                    <p className="font-semibold text-gray-900">{n.titre}</p>
                    <p className="mt-1 text-sm text-gray-600">{n.message}</p>
                    <p className="mt-2 text-xs text-gray-400">{n.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
