'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Menu, AlertCircle, CheckCircle, XCircle, Calendar, Briefcase, ChevronLeft, ChevronRight, Heart, Pencil, Download, ArrowRight, Edit2, X as XIcon, Check, MapPin, Phone, Mail, FileText, User as UserIcon, Trash2 } from 'lucide-react';
import CandidateSidebar, { type CandidateTab } from '../../components/CandidateSidebar';
import JobOfferCard from '../../components/JobOfferCard';
import { api, mapOffre, type Job } from '../../lib/api';
import { useFavoris } from '../../context/FavorisContext';

const COLORS = {
  midnight: '#1e3a8a',
  yellow: '#facc15',
  green: '#16a34a',
};

type CandidatureStatus = 'ENTRETIEN' | 'EN_COURS' | 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE';
type ContractType = 'CDI' | 'CDD' | 'Stage';

// Convertit le statut réel de la candidature (backend) vers celui affiché par la frise/le badge
function mapStatutFrise(statutBackend: string): CandidatureStatus {
  switch (statutBackend) {
    case 'EN_EXAMEN':
      return 'EN_COURS';
    case 'ENTRETIEN':
      return 'ENTRETIEN';
    case 'ACCEPTEE':
      return 'ACCEPTEE';
    case 'REJETEE':
      return 'REFUSEE';
    default:
      return 'EN_ATTENTE';
  }
}

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

// TODO : à remplacer par les vraies données quand le backend sera connecté
const DONNEES_PROVISOIRES = {
  pourcentageProfilComplété: 75,
  photoProfil: null, // null = utiliser l'avatar par défaut
  // Champs manquants en base pour le profil
  photo: null, // TODO : champ absent en base
};

function ilYA(dateStr: string): string {
  const jours = Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)));
  if (jours === 0) return "Aujourd'hui";
  if (jours === 1) return 'Il y a 1 jour';
  return `Il y a ${jours} jours`;
}

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

const ENTRETIEN_TYPE_STYLES: Record<string, { bg: string; text: string }> = {
  presentiel: { bg: '#D1FAE5', text: '#065F46' },
  visio: { bg: '#DBEAFE', text: '#1E40AF' },
};

function EntretienTypeBadge({ type }: { type: string }) {
  const style = ENTRETIEN_TYPE_STYLES[type] || { bg: '#E2E8F0', text: '#4B5563' };
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
  else if (status === 'EN_COURS') etapeCourante = 1;
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
  const { user, isAuthenticated, isLoading, isRecruiter, updateUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<CandidateTab>('apercu');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [candidatures, setCandidatures] = useState<any[]>([]);
  const [entretiens, setEntretiens] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [offresRecommandees, setOffresRecommandees] = useState<Job[]>([]);
  const [mesFavorisJobs, setMesFavorisJobs] = useState<Job[]>([]);
  const { isFavori, toggleFavori, favorisIds } = useFavoris();
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [mesDocuments, setMesDocuments] = useState<{ id: number; libelle: string; chemin: string; extension: string }[]>([]);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileFormData, setProfileFormData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
    quartier: user?.quartier || '',
    sexe: user?.sexe || '',
    ville: user?.ville || '',
    anneesExperience: user?.annees_experience ?? 0,
    niveauEtude: user?.niveau_etude || '',
    domaineEtudes: user?.domaine_etudes || '',
    competences: user?.competences || '',
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Resynchronise le formulaire dès que les vraies données du profil sont chargées/modifiées
  useEffect(() => {
    if (!user) return;
    setProfileFormData({
      nom: user.nom || '',
      prenom: user.prenom || '',
      email: user.email || '',
      telephone: user.telephone || '',
      quartier: user.quartier || '',
      sexe: user.sexe || '',
      ville: user.ville || '',
      anneesExperience: user.annees_experience ?? 0,
      niveauEtude: user.niveau_etude || '',
      domaineEtudes: user.domaine_etudes || '',
      competences: user.competences || '',
    });
  }, [user]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/profil&message=auth_required');
    }
    if (!isLoading && isRecruiter) {
      router.push('/rh/dashboard');
    }
  }, [isAuthenticated, isLoading, isRecruiter, router]);

  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) return;
      
      setIsDataLoading(true);
      try {
        // Charger les candidatures
        const candidaturesData = await api.getMyApplications();
        setCandidatures(candidaturesData);

        // Charger des offres réelles à recommander (celles auxquelles le candidat n'a pas encore postulé)
        try {
          const offresData = await api.getOffres();
          const idsDejaPostules = new Set(candidaturesData.map((c: any) => c.id_offre));
          const offresDisponibles = offresData
            .filter((o) => !idsDejaPostules.has(o.id))
            .map(mapOffre);
          setOffresRecommandees(offresDisponibles);
        } catch (err) {
          console.error('Erreur chargement offres recommandées:', err);
          setOffresRecommandees([]);
        }


        // Charger les entretiens
        try {
          const entretiensData = await api.getEntretiens();
          setEntretiens(entretiensData);
        } catch (err) {
          console.error('Erreur chargement entretiens:', err);
          setEntretiens([]);
        }

        // Charger mes favoris
        try {
          const favorisData = await api.getFavoris();
          setMesFavorisJobs(favorisData.map((f) => mapOffre(f.offre)));
        } catch (err) {
          console.error('Erreur chargement favoris:', err);
          setMesFavorisJobs([]);
        }

        // Charger mes documents de profil
        try {
          const documentsData = await api.getMyFiles();
          setMesDocuments(documentsData);
        } catch (err) {
          console.error('Erreur chargement documents:', err);
          setMesDocuments([]);
        }
        
        // Charger les notifications
        try {
          const notificationsData = await api.getNotifications();
          setNotifications(notificationsData);
        } catch (err) {
          console.error('Erreur chargement notifications:', err);
          setNotifications([]);
        }
      } catch (err) {
        console.error('Erreur chargement données:', err);
      } finally {
        setIsDataLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated]);

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

  const RECOS_PAR_PAGE = 3;
  const totalPagesRecos = Math.max(1, Math.ceil(offresRecommandees.length / RECOS_PAR_PAGE));
  const offresRecommandeesVisibles = offresRecommandees.slice(
    carouselIndex * RECOS_PAR_PAGE,
    carouselIndex * RECOS_PAR_PAGE + RECOS_PAR_PAGE
  );

  const handleCarouselPrev = () => {
    setCarouselIndex((prev) => (prev === 0 ? totalPagesRecos - 1 : prev - 1));
  };

  const handleCarouselNext = () => {
    setCarouselIndex((prev) => (prev === totalPagesRecos - 1 ? 0 : prev + 1));
  };

  const validateProfileForm = () => {
    const newErrors: Record<string, string> = {};

    if (!profileFormData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!profileFormData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!profileFormData.telephone.trim()) newErrors.telephone = 'Le téléphone est requis';
    if (!profileFormData.quartier.trim()) newErrors.quartier = 'Le quartier est requis';

    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfileForm()) return;

    setIsSavingProfile(true);
    try {
      const response = await api.updateProfile({
        nom: profileFormData.nom,
        prenom: profileFormData.prenom,
        telephone: profileFormData.telephone,
        quartier: profileFormData.quartier,
        sexe: profileFormData.sexe,
        ville: profileFormData.ville,
        annees_experience: profileFormData.anneesExperience,
        niveau_etude: profileFormData.niveauEtude,
        domaine_etudes: profileFormData.domaineEtudes,
        competences: profileFormData.competences,
      });
      updateUser(response.user);
      setIsEditingProfile(false);
    } catch (err: any) {
      setProfileErrors({ general: err.message || 'Erreur lors de la sauvegarde du profil' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelProfile = () => {
    setProfileFormData({
      nom: user?.nom || '',
      prenom: user?.prenom || '',
      email: user?.email || '',
      telephone: user?.telephone || '',
      quartier: user?.quartier || '',
      sexe: user?.sexe || '',
      ville: user?.ville || '',
      anneesExperience: user?.annees_experience ?? 0,
      niveauEtude: user?.niveau_etude || '',
      domaineEtudes: user?.domaine_etudes || '',
      competences: user?.competences || '',
    });
    setProfileErrors({});
    setIsEditingProfile(false);
  };

  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setDocError(null);
    setIsUploadingDoc(true);
    try {
      await api.uploadFile(file, undefined, file.name);
      const documentsData = await api.getMyFiles();
      setMesDocuments(documentsData);
    } catch (err: any) {
      setDocError(err.message || "Erreur lors de l'envoi du document");
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (id: number) => {
    if (!confirm('Supprimer ce document ?')) return;
    try {
      await api.deleteFile(id);
      setMesDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la suppression du document');
    }
  };

  const inputClass =
    'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent';
  const inputClassError =
    'w-full rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent';
  const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';

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
                      {candidatures.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Aucune candidature</p>
                      ) : (
                        candidatures.slice(0, 3).map((c) => (
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
                                  <p className="truncate font-semibold text-gray-900">{c.offre?.titre || 'Poste'}</p>
                                  <p className="text-sm text-gray-500">
                                    {c.offre?.localisation || 'Lieu non précisé'}
                                  </p>
                                </div>
                              </div>
                              {/* DROITE : Badge de statut */}
                              <StatusBadge status={mapStatutFrise(c.statut)} />
                            </div>

                            {/* RANGÉE 2 : Frise de progression */}
                            <div className="w-full">
                              <ProgressionFrise status={mapStatutFrise(c.statut)} />
                            </div>
                          </div>
                        ))
                      )}
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
                      {offresRecommandeesVisibles.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Aucune offre disponible pour le moment</p>
                      ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {offresRecommandeesVisibles.map((offre) => {
                            const favori = isFavori(offre.id);
                            return (
                              <div
                                key={offre.id}
                                className="rounded-xl border border-gray-100 p-5 transition-shadow hover:shadow-md"
                              >
                                {/* Ligne du haut : type + cœur */}
                                <div className="mb-3 flex items-center justify-between">
                                  <span
                                    className="inline-flex rounded-full px-2 py-0.5 text-xs font-bold"
                                    style={{ backgroundColor: COLORS.yellow, color: COLORS.midnight }}
                                  >
                                    {offre.type}
                                  </span>
                                  <button
                                    onClick={() => toggleFavori(offre.id)}
                                    className="p-1 text-gray-400 transition-colors hover:text-red-500"
                                    aria-label={favori ? 'Retirer des favoris' : 'Sauvegarder cette offre'}
                                    aria-pressed={favori}
                                  >
                                    <Heart size={18} className={favori ? 'text-red-500' : undefined} fill={favori ? 'currentColor' : 'none'} />
                                  </button>
                                </div>
                                {/* Titre */}
                                <h3
                                  className="mb-2 text-lg font-semibold"
                                  style={{ color: COLORS.midnight }}
                                >
                                  {offre.title}
                                </h3>
                                {/* Département et ville */}
                                <p className="mb-4 text-sm text-gray-600">
                                  {offre.department} · {offre.location}
                                </p>
                                {/* Ligne du bas : date + détails */}
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-gray-500">{offre.createdAt ? ilYA(offre.createdAt) : offre.postedDate}</p>
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
                            );
                          })}
                        </div>
                      )}
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

                        {docError && (
                          <p className="mb-2 text-xs text-red-600">{docError}</p>
                        )}

                        {mesDocuments.length === 0 ? (
                          <p className="text-sm text-gray-500">Aucun document ajouté pour le moment.</p>
                        ) : (
                          <div className="space-y-2">
                            {mesDocuments.map((doc) => (
                              <div key={doc.id} className="flex items-center justify-between rounded-xl border border-gray-100 p-3">
                                <div className="flex min-w-0 items-center gap-3">
                                  <div
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                                    style={{ backgroundColor: '#F3F4F6', color: COLORS.midnight }}
                                  >
                                    <FileText size={18} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-gray-900">{doc.libelle}</p>
                                    <p className="text-xs text-gray-500">{doc.extension.toUpperCase()}</p>
                                  </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-1">
                                  <a
                                    href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${doc.chemin}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-gray-400 transition-colors hover:text-gray-600"
                                    aria-label="Télécharger le document"
                                  >
                                    <Download size={18} />
                                  </a>
                                  <button
                                    onClick={() => handleDeleteDocument(doc.id)}
                                    className="p-2 text-gray-400 transition-colors hover:text-red-500"
                                    aria-label="Supprimer le document"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={handleUploadDocument}
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingDoc}
                          className="mt-3 w-full rounded-xl border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-700 disabled:opacity-60"
                        >
                          <span className="mr-2 text-lg">+</span>
                          {isUploadingDoc ? 'Envoi en cours...' : 'Ajouter un document (CV, etc.)'}
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
                Mes candidatures ({candidatures.length})
              </h2>
              <div className="space-y-4 p-6">
                {candidatures.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Aucune candidature</p>
                ) : (
                  candidatures.map((c) => (
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
                              <p className="truncate font-semibold text-gray-900">{c.offre?.titre || 'Poste'}</p>
                              <p className="text-sm text-gray-500">
                                {c.offre?.localisation || 'Lieu non précisé'}
                              </p>
                            </div>
                            <StatusBadge status={mapStatutFrise(c.statut)} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Contenu de l'onglet Mes favoris */}
          {activeTab === 'favoris' && (
            <div>
              <h2 className="mb-4 text-lg font-bold text-gray-900">
                Mes favoris ({mesFavorisJobs.filter((j) => favorisIds.has(j.id)).length})
              </h2>
              {mesFavorisJobs.filter((j) => favorisIds.has(j.id)).length === 0 ? (
                <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
                  <p className="text-sm text-gray-500">
                    Aucune offre sauvegardée pour le moment.{' '}
                    <Link href="/offres" className="font-semibold text-blue-600 hover:text-blue-700">
                      Parcourir les offres
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {mesFavorisJobs
                    .filter((j) => favorisIds.has(j.id))
                    .map((job) => (
                      <JobOfferCard key={job.id} job={job} />
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Contenu de l'onglet Mes entretiens */}
          {activeTab === 'entretiens' && (
            <div>
              <h2 className="mb-4 text-lg font-bold text-gray-900">Mes entretiens ({entretiens.length})</h2>
              {entretiens.length === 0 ? (
                <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
                  <p className="text-sm text-gray-500">Aucun entretien planifié pour le moment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {entretiens.map((entretien) => {
                    const date = new Date(entretien.date);
                    return (
                      <Link
                        key={entretien.id}
                        href={`/candidat/entretiens/${entretien.id}`}
                        className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 p-5 transition-all hover:shadow-md hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100"
                            style={{ color: COLORS.midnight }}
                          >
                            <Calendar size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-gray-900">{entretien.candidature?.offre?.titre || 'Poste'}</p>
                            <p className="text-sm text-gray-500">
                              {date.toLocaleDateString('fr-FR')} à {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-sm text-gray-500">Avec {entretien.utilisateur_entretien_utilisateurrh_idToutilisateur?.prenom} {entretien.utilisateur_entretien_utilisateurrh_idToutilisateur?.nom}</p>
                          </div>
                        </div>
                        <EntretienTypeBadge type={entretien.type === 'visio' ? 'Visio' : 'Présentiel'} />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Contenu de l'onglet Notifications */}
          {activeTab === 'notifications' && (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-gray-900">Notifications</h2>
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Aucune notification</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="rounded-xl bg-gray-50 px-5 py-4">
                      <p className="font-semibold text-gray-900">{n.titre}</p>
                      <p className="mt-1 text-sm text-gray-600">{n.contenu}</p>
                      <p className="mt-2 text-xs text-gray-400">{new Date(n.date_envoi).toLocaleDateString('fr-FR')}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Contenu de l'onglet Mon profil */}
          {activeTab === 'profil' && (
            <div className="space-y-6">
              {/* En-tête profil */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {/* Avatar */}
                  <div
                    className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white"
                    style={{ backgroundColor: COLORS.midnight }}
                  >
                    {DONNEES_PROVISOIRES.photo ? (
                      <img
                        src={DONNEES_PROVISOIRES.photo}
                        alt={`${user?.prenom} ${user?.nom}`}
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    ) : (
                      initial
                    )}
                  </div>

                  {/* Informations */}
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: COLORS.midnight }}>
                      {user?.prenom} {user?.nom}
                    </h1>
                    <p className="text-gray-600 mb-4">{user?.email}</p>
                    <button
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                      style={{ backgroundColor: isEditingProfile ? '#E5E7EB' : COLORS.midnight, color: isEditingProfile ? '#374151' : 'white' }}
                    >
                      {isEditingProfile ? (
                        <>
                          <XIcon size={18} />
                          Annuler
                        </>
                      ) : (
                        <>
                          <Edit2 size={18} />
                          Modifier mon profil
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {isEditingProfile ? (
                <div className="space-y-6">
                  {/* Formulaire d'édition */}
                  <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${COLORS.yellow}33` }}
                      >
                        <UserIcon size={20} style={{ color: COLORS.midnight }} aria-hidden="true" />
                      </div>
                      <h2 className="text-lg font-bold" style={{ color: COLORS.midnight }}>
                        Informations personnelles
                      </h2>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="nom" className={labelClass}>
                            Nom <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="nom"
                            type="text"
                            value={profileFormData.nom}
                            onChange={(e) => setProfileFormData({ ...profileFormData, nom: e.target.value })}
                            className={profileErrors.nom ? inputClassError : inputClass}
                          />
                          {profileErrors.nom && <p className="mt-1 text-xs text-red-600">{profileErrors.nom}</p>}
                        </div>
                        <div>
                          <label htmlFor="prenom" className={labelClass}>
                            Prénoms <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="prenom"
                            type="text"
                            value={profileFormData.prenom}
                            onChange={(e) => setProfileFormData({ ...profileFormData, prenom: e.target.value })}
                            className={profileErrors.prenom ? inputClassError : inputClass}
                          />
                          {profileErrors.prenom && <p className="mt-1 text-xs text-red-600">{profileErrors.prenom}</p>}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="email" className={labelClass}>
                          E-mail <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={profileFormData.email}
                          disabled
                          className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
                        />
                        <p className="mt-1 text-xs text-gray-400">L'e-mail ne peut pas être modifié (identifiant de connexion)</p>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="telephone" className={labelClass}>
                            Téléphone <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="telephone"
                            type="tel"
                            value={profileFormData.telephone}
                            onChange={(e) => setProfileFormData({ ...profileFormData, telephone: e.target.value })}
                            className={profileErrors.telephone ? inputClassError : inputClass}
                          />
                          {profileErrors.telephone && <p className="mt-1 text-xs text-red-600">{profileErrors.telephone}</p>}
                        </div>
                        <div>
                          <label htmlFor="quartier" className={labelClass}>
                            Quartier <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="quartier"
                            type="text"
                            value={profileFormData.quartier}
                            onChange={(e) => setProfileFormData({ ...profileFormData, quartier: e.target.value })}
                            className={profileErrors.quartier ? inputClassError : inputClass}
                          />
                          {profileErrors.quartier && <p className="mt-1 text-xs text-red-600">{profileErrors.quartier}</p>}
                        </div>
                      </div>

                      {/* Champs manquants en base */}
                      <div>
                        <label htmlFor="sexe" className={labelClass}>
                          Sexe <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                              type="radio"
                              name="sexe"
                              value="Masculin"
                              checked={profileFormData.sexe === 'Masculin'}
                              onChange={(e) => setProfileFormData({ ...profileFormData, sexe: e.target.value })}
                              style={{ accentColor: COLORS.midnight }}
                              className="h-4 w-4"
                            />
                            Masculin
                          </label>
                          <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                              type="radio"
                              name="sexe"
                              value="Féminin"
                              checked={profileFormData.sexe === 'Féminin'}
                              onChange={(e) => setProfileFormData({ ...profileFormData, sexe: e.target.value })}
                              style={{ accentColor: COLORS.midnight }}
                              className="h-4 w-4"
                            />
                            Féminin
                          </label>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="ville" className={labelClass}>
                          Ville de résidence <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="ville"
                          type="text"
                          value={profileFormData.ville}
                          onChange={(e) => setProfileFormData({ ...profileFormData, ville: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </section>

                  <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${COLORS.yellow}33` }}
                      >
                        <Briefcase size={20} style={{ color: COLORS.midnight }} aria-hidden="true" />
                      </div>
                      <h2 className="text-lg font-bold" style={{ color: COLORS.midnight }}>
                        Parcours
                      </h2>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="anneesExperience" className={labelClass}>
                          Années d'expérience <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="anneesExperience"
                          type="number"
                          min={0}
                          value={profileFormData.anneesExperience}
                          onChange={(e) => setProfileFormData({ ...profileFormData, anneesExperience: parseInt(e.target.value) || 0 })}
                          className={inputClass}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="niveauEtude" className={labelClass}>
                            Niveau d'étude <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="niveauEtude"
                            type="text"
                            value={profileFormData.niveauEtude}
                            onChange={(e) => setProfileFormData({ ...profileFormData, niveauEtude: e.target.value })}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label htmlFor="domaineEtudes" className={labelClass}>
                            Domaine d'études <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="domaineEtudes"
                            type="text"
                            value={profileFormData.domaineEtudes}
                            onChange={(e) => setProfileFormData({ ...profileFormData, domaineEtudes: e.target.value })}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="competences" className={labelClass}>
                          Compétences
                        </label>
                        <input
                          id="competences"
                          type="text"
                          value={profileFormData.competences}
                          onChange={(e) => setProfileFormData({ ...profileFormData, competences: e.target.value })}
                          placeholder="Ex: React, Node.js, SQL"
                          className={inputClass}
                        />
                        <p className="mt-1 text-xs text-gray-400">
                          Séparées par des virgules — utilisées pour calculer ta compatibilité avec les offres.
                        </p>
                      </div>
                    </div>
                  </section>

                  {profileErrors.general && (
                    <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-md">
                      {profileErrors.general}
                    </div>
                  )}

                  {/* Boutons d'action */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancelProfile}
                      disabled={isSavingProfile}
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSavingProfile}
                      className="flex-1 rounded-lg px-4 py-3 font-bold text-gray-900 shadow-sm transition-opacity hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-70"
                      style={{ backgroundColor: COLORS.yellow }}
                    >
                      <Check size={18} />
                      {isSavingProfile ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Affichage en lecture seule */}
                  <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${COLORS.yellow}33` }}
                      >
                        <UserIcon size={20} style={{ color: COLORS.midnight }} aria-hidden="true" />
                      </div>
                      <h2 className="text-lg font-bold" style={{ color: COLORS.midnight }}>
                        Informations personnelles
                      </h2>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Nom</p>
                          <p className="font-semibold text-gray-900">{user?.nom}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Prénoms</p>
                          <p className="font-semibold text-gray-900">{user?.prenom}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 mb-1">E-mail</p>
                        <p className="font-semibold text-gray-900 flex items-center gap-2">
                          <Mail size={16} className="text-gray-400" />
                          {user?.email}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Téléphone</p>
                          <p className="font-semibold text-gray-900 flex items-center gap-2">
                            <Phone size={16} className="text-gray-400" />
                            {user?.telephone}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Quartier</p>
                          <p className="font-semibold text-gray-900 flex items-center gap-2">
                            <MapPin size={16} className="text-gray-400" />
                            {user?.quartier}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 mb-1">Sexe</p>
                        <p className="font-semibold text-gray-900">{user?.sexe || 'Non renseigné'}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 mb-1">Ville de résidence</p>
                        <p className="font-semibold text-gray-900 flex items-center gap-2">
                          <MapPin size={16} className="text-gray-400" />
                          {user?.ville || 'Non renseignée'}
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${COLORS.yellow}33` }}
                      >
                        <Briefcase size={20} style={{ color: COLORS.midnight }} aria-hidden="true" />
                      </div>
                      <h2 className="text-lg font-bold" style={{ color: COLORS.midnight }}>
                        Parcours
                      </h2>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Années d'expérience</p>
                        <p className="font-semibold text-gray-900">
                          {user?.annees_experience != null ? `${user.annees_experience} ans` : 'Non renseigné'}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Niveau d'étude</p>
                          <p className="font-semibold text-gray-900">{user?.niveau_etude || 'Non renseigné'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Domaine d'études</p>
                          <p className="font-semibold text-gray-900">{user?.domaine_etudes || 'Non renseigné'}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 mb-1">Compétences</p>
                        <p className="font-semibold text-gray-900">{user?.competences || 'Non renseignées'}</p>
                      </div>
                    </div>
                  </section>

                  <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${COLORS.yellow}33` }}
                      >
                        <FileText size={20} style={{ color: COLORS.midnight }} aria-hidden="true" />
                      </div>
                      <h2 className="text-lg font-bold" style={{ color: COLORS.midnight }}>
                        Mes documents
                      </h2>
                    </div>

                    {docError && (
                      <p className="mb-2 text-xs text-red-600">{docError}</p>
                    )}

                    {mesDocuments.length === 0 ? (
                      <p className="text-sm text-gray-500">Aucun document ajouté pour le moment.</p>
                    ) : (
                      <div className="space-y-2">
                        {mesDocuments.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between rounded-xl border border-gray-100 p-4">
                            <div className="flex min-w-0 items-center gap-3">
                              <FileText size={20} className="shrink-0 text-gray-500" />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-gray-900">{doc.libelle}</p>
                                <p className="text-xs text-gray-500">{doc.extension.toUpperCase()}</p>
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-3">
                              <a
                                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${doc.chemin}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                              >
                                <Download size={16} />
                                Télécharger
                              </a>
                              <button
                                onClick={() => handleDeleteDocument(doc.id)}
                                className="text-gray-400 hover:text-red-500"
                                aria-label="Supprimer le document"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingDoc}
                      className="mt-3 w-full rounded-xl border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-700 disabled:opacity-60"
                    >
                      <span className="mr-2 text-lg">+</span>
                      {isUploadingDoc ? 'Envoi en cours...' : 'Ajouter un document'}
                    </button>
                  </section>

                  <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${COLORS.yellow}33` }}
                      >
                        <Calendar size={20} style={{ color: COLORS.midnight }} aria-hidden="true" />
                      </div>
                      <h2 className="text-lg font-bold" style={{ color: COLORS.midnight }}>
                        Mon activité
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <button
                        onClick={() => setActiveTab('candidatures')}
                        className="flex items-center gap-4 rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50 text-left"
                      >
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-xl"
                          style={{ backgroundColor: '#F3F4F6', color: COLORS.midnight }}
                        >
                          <Briefcase size={20} />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{candidatures.length}</p>
                          <p className="text-sm text-gray-600">Candidatures déposées</p>
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveTab('entretiens')}
                        className="flex items-center gap-4 rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50 text-left"
                      >
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-xl"
                          style={{ backgroundColor: '#F3F4F6', color: COLORS.midnight }}
                        >
                          <Calendar size={20} />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{entretiens.length}</p>
                          <p className="text-sm text-gray-600">Entretiens programmés</p>
                        </div>
                      </button>
                    </div>
                  </section>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
