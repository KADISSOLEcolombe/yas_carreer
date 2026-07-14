'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Menu, AlertCircle, CheckCircle, XCircle, Calendar, Briefcase, ChevronLeft, ChevronRight, Heart, Pencil, Download, ArrowRight } from 'lucide-react';
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

// TODO : à remplacer par les vraies données quand le backend sera connecté
const DONNEES_PROVISOIRES = {
  pourcentageCorrespondance: [85, 92, 78], // Pour les offres recommandées
  pourcentageProfilComplété: 75,
  photoProfil: null, // null = utiliser l'avatar par défaut
  nomsEntreprises: ['YAS Togo', 'Digital Solutions', 'Tech Africa'],
  offresRecommandées: [
    {
      id: 1,
      titre: 'Développeur Frontend',
      entreprise: 'YAS Togo',
      tags: ['React', 'TypeScript', 'Remote'],
      date: 'Il y a 2 jours',
      correspondance: 85,
    },
    {
      id: 2,
      titre: 'UX Designer Senior',
      entreprise: 'Digital Solutions',
      tags: ['Figma', 'Design System', 'Mobile'],
      date: 'Il y a 3 jours',
      correspondance: 92,
    },
    {
      id: 3,
      titre: 'Product Manager',
      entreprise: 'Tech Africa',
      tags: ['Agile', 'Scrum', 'Strategy'],
      date: 'Il y a 5 jours',
      correspondance: 78,
    },
  ],
};

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

// Frise de progression pour les candidatures
function ProgressionFrise({ status }: { status: CandidatureStatus }) {
  const etapes = [
    { label: 'POSTULÉ', key: 'postule' },
    { label: 'EN RÉVISION', key: 'revision' },
    { label: 'ENTRETIEN', key: 'entretien' },
    { label: 'OFFRE', key: 'offre' },
  ];

  let etapeCourante = 0;
  if (status === 'EN_ATTENTE') etapeCourante = 1;
  else if (status === 'ENTRETIEN') etapeCourante = 2;
  else if (status === 'ACCEPTEE') etapeCourante = 3;
  else if (status === 'REFUSEE') etapeCourante = -1; // Refusée

  const estRefusee = status === 'REFUSEE';

  return (
    <div className="w-full">
      {estRefusee ? (
        <div className="flex items-center gap-2">
          <div className="h-1 flex-1 rounded-full bg-gray-200" />
          <span className="text-xs font-semibold text-red-600">REFUSÉE</span>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-0">
          {etapes.map((etape, index) => {
            const estPasse = index < etapeCourante;
            const estCourant = index === etapeCourante;
            const estFutur = index > etapeCourante;

            return (
              <div key={etape.key} className="flex flex-col items-center">
                <div className="relative flex w-full items-center justify-center">
                  {/* Ligne avant le point */}
                  {index > 0 && (
                    <div
                      className={`absolute left-0 right-1/2 h-0.5 ${
                        estPasse ? 'bg-yellow-400' : 'bg-gray-200'
                      }`}
                      aria-hidden="true"
                    />
                  )}
                  {/* Ligne après le point */}
                  {index < etapes.length - 1 && (
                    <div
                      className={`absolute left-1/2 right-0 h-0.5 ${
                        estPasse || estCourant ? 'bg-yellow-400' : 'bg-gray-200'
                      }`}
                      aria-hidden="true"
                    />
                  )}
                  {/* Point */}
                  <div
                    className={`relative z-10 flex h-3 w-3 shrink-0 items-center justify-center rounded-full ${
                      estPasse
                        ? 'bg-yellow-400'
                        : estCourant
                        ? 'bg-yellow-400 ring-4 ring-yellow-100'
                        : 'bg-gray-300'
                    }`}
                    aria-label={`Étape ${index + 1} : ${etape.label}`}
                  >
                    {estCourant && (
                      <div className="h-1.5 w-1.5 rounded-full bg-yellow-600" />
                    )}
                  </div>
                </div>
                <span
                  className={`mt-2 text-[10px] font-medium uppercase ${
                    estPasse || estCourant ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {etape.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
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
  const [carouselIndex, setCarouselIndex] = useState(0);

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
  const prenom = user?.nom?.split(' ')[0] || 'Candidat';

  const handleCarouselPrev = () => {
    setCarouselIndex((prev) => (prev === 0 ? DONNEES_PROVISOIRES.offresRecommandées.length - 1 : prev - 1));
  };

  const handleCarouselNext = () => {
    setCarouselIndex((prev) => (prev === DONNEES_PROVISOIRES.offresRecommandées.length - 1 ? 0 : prev + 1));
  };

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
          {/* Contenu de l'onglet Aperçu */}
          {activeTab === 'apercu' && (
            <div className="space-y-6">
              {/* En-tête simple */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: COLORS.midnight }}>
                    Bonjour, {prenom} !
                  </h1>
                  <p className="text-sm text-gray-600">
                    Voici un aperçu de vos candidatures et opportunités.
                  </p>
                </div>
                <Link
                  href="/offres"
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: COLORS.midnight }}
                >
                  <Search size={16} />
                  Explorer les offres
                </Link>
              </div>

              {/* Layout 2 colonnes */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Colonne gauche (~2/3) */}
                <div className="space-y-6 lg:col-span-2">
                  {/* Section Mes candidatures */}
                  <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                      <h2 className="text-lg font-bold text-gray-900">Mes candidatures</h2>
                      <Link
                        href="/profil"
                        onClick={() => setActiveTab('candidatures')}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Voir tout
                      </Link>
                    </div>
                    <div className="space-y-4 p-6">
                      {MOCK_CANDIDATURES.map((c) => (
                        <div
                          key={c.id}
                          className="flex flex-col gap-6 rounded-xl border border-gray-100 p-4 transition-shadow hover:shadow-md"
                        >
                          {/* RANGÉE 1 : Icône + titre + badge */}
                          <div className="flex items-start justify-between gap-4">
                            {/* GAUCHE : Icône + titre + département */}
                            <div className="flex items-start gap-4">
                              <div
                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                                style={{ backgroundColor: '#F3F4F6', color: COLORS.midnight }}
                              >
                                <Briefcase size={20} />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-gray-900">{c.poste}</p>
                                <p className="text-sm text-gray-500">
                                  {DONNEES_PROVISOIRES.nomsEntreprises[c.id - 1] || 'Entreprise'}
                                </p>
                              </div>
                            </div>
                            {/* DROITE : Badge de statut */}
                            <StatusBadge status={c.status} />
                          </div>

                          {/* RANGÉE 2 : Frise de progression */}
                          <div className="w-full">
                            <ProgressionFrise status={c.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section Offres recommandées */}
                  <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                      <h2 className="text-lg font-bold text-gray-900">Offres recommandées</h2>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCarouselPrev}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-colors hover:bg-gray-50"
                          aria-label="Offre précédente"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          onClick={handleCarouselNext}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-colors hover:bg-gray-50"
                          aria-label="Offre suivante"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {DONNEES_PROVISOIRES.offresRecommandées.map((offre) => (
                          <div
                            key={offre.id}
                            className="rounded-xl border border-gray-100 p-5 transition-shadow hover:shadow-md"
                          >
                            {/* Ligne du haut : badge match + cœur */}
                            <div className="mb-3 flex items-center justify-between">
                              <span
                                className="inline-flex rounded-full px-2 py-0.5 text-xs font-bold"
                                style={{ backgroundColor: COLORS.yellow, color: COLORS.midnight }}
                              >
                                {offre.correspondance}% MATCH
                              </span>
                              <button
                                className="p-1 text-gray-400 transition-colors hover:text-red-500"
                                aria-label="Sauvegarder cette offre"
                              >
                                <Heart size={18} />
                              </button>
                            </div>
                            {/* Titre */}
                            <h3
                              className="mb-2 text-lg font-semibold"
                              style={{ color: COLORS.midnight }}
                            >
                              {offre.titre}
                            </h3>
                            {/* Entreprise et ville */}
                            <p className="mb-3 text-sm text-gray-600">
                              {offre.entreprise} · Lomé
                            </p>
                            {/* Tags */}
                            <div className="mb-4 flex flex-wrap gap-2">
                              {offre.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            {/* Ligne du bas : date + détails */}
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-500">{offre.date}</p>
                              <Link
                                href={`/offres/${offre.id}`}
                                className="inline-flex items-center gap-1 text-sm font-semibold"
                                style={{ color: COLORS.midnight }}
                              >
                                Détails
                                <ArrowRight size={14} />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Colonne droite (~1/3) */}
                <div className="space-y-6">
                  {/* Carte Mon profil */}
                  <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                    <div className="p-6">
                      {/* Photo/avatar */}
                      <div className="mb-6 flex items-center gap-4">
                        {DONNEES_PROVISOIRES.photoProfil ? (
                          <img
                            src={DONNEES_PROVISOIRES.photoProfil}
                            alt="Photo de profil"
                            className="h-16 w-16 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold"
                            style={{ backgroundColor: COLORS.midnight, color: COLORS.yellow }}
                          >
                            {initial}
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{user?.nom || 'Candidat'}</h3>
                          <p className="text-sm text-gray-500">Candidat</p>
                        </div>
                        <button
                          className="p-2 text-gray-400 transition-colors hover:text-gray-600"
                          aria-label="Modifier la photo de profil"
                        >
                          <Pencil size={16} />
                        </button>
                      </div>

                      {/* Section Documents */}
                      <div className="mb-6">
                        <h4 className="mb-3 text-xs font-semibold uppercase text-gray-500">DOCUMENTS</h4>
                        <div className="flex items-center justify-between rounded-xl border border-gray-100 p-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-lg"
                              style={{ backgroundColor: '#F3F4F6', color: COLORS.midnight }}
                            >
                              <Download size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Curriculum_Vitae.pdf</p>
                              <p className="text-xs text-gray-500">PDF · 2.4 MB</p>
                            </div>
                          </div>
                          <button
                            className="p-2 text-gray-400 transition-colors hover:text-gray-600"
                            aria-label="Télécharger le CV"
                          >
                            <Download size={18} />
                          </button>
                        </div>
                        {/* Bouton mise à jour CV sur ligne séparée */}
                        <button className="mt-3 w-full rounded-xl border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-700">
                          <span className="mr-2 text-lg">+</span>
                          Mettre à jour le CV
                        </button>
                      </div>

                      {/* Barre de progression Profil complété */}
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-gray-900">Profil complété</h4>
                          <span
                            className="text-sm font-bold"
                            style={{ color: COLORS.midnight }}
                          >
                            {DONNEES_PROVISOIRES.pourcentageProfilComplété}%
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-100">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${DONNEES_PROVISOIRES.pourcentageProfilComplété}%`,
                              backgroundColor: COLORS.yellow,
                            }}
                          />
                        </div>
                        <p className="mt-2 text-xs text-gray-400">
                          Ajoutez vos références pour atteindre 100%.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contenu de l'onglet Mes candidatures */}
          {activeTab === 'candidatures' && (
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <h2 className="border-b border-gray-100 px-6 py-5 text-lg font-bold text-gray-900">
                Mes candidatures ({MOCK_CANDIDATURES.length})
              </h2>
              <div className="space-y-4 p-6">
                {MOCK_CANDIDATURES.map((c) => (
                  <Link
                    key={c.id}
                    href={`/candidat/candidatures/${c.id}`}
                    className="block rounded-xl border border-gray-100 p-4 transition-all hover:shadow-md hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: '#F3F4F6', color: COLORS.midnight }}
                      >
                        <Briefcase size={20} />
                      </div>
                      <div className="flex min-w-0 flex-1">
                        <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-900">{c.poste}</p>
                            <p className="text-sm text-gray-500">
                              {DONNEES_PROVISOIRES.nomsEntreprises[c.id - 1] || 'Entreprise'}
                            </p>
                          </div>
                          <StatusBadge status={c.status} />
                        </div>
                      </div>
                    </div>
                  </Link>
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
