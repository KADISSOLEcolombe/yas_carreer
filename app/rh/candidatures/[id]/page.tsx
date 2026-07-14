'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Briefcase, Calendar, MapPin, Phone, Mail, FileText, Download, Check, X } from 'lucide-react';

const COLORS = {
  midnight: '#1e3a8a',
  yellow: '#facc15',
};

type CandidatureStatus = 'ENTRETIEN' | 'EN_COURS' | 'EN_ATTENTE' | 'ACCEPTE' | 'REFUSE';

const STATUS_STYLES: Record<CandidatureStatus, { bg: string; text: string; label: string }> = {
  ENTRETIEN: { bg: '#EDE9FE', text: '#6D28D9', label: 'Entretien planifié' },
  EN_COURS: { bg: '#DBEAFE', text: '#1E40AF', label: 'En cours' },
  EN_ATTENTE: { bg: '#FEF3C7', text: '#92400E', label: 'En attente' },
  ACCEPTE: { bg: '#D1FAE5', text: '#065F46', label: 'Accepté' },
  REFUSE: { bg: '#FEE2E2', text: '#DC2626', label: 'Refusé' },
};

// TODO : à remplacer par les vraies données quand le backend sera connecté
const MOCK_CANDIDATURES: Record<number, {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  poste: string;
  date: string;
  status: CandidatureStatus;
  type: string;
  cvFile?: string;
  lettreFile?: string;
  description?: string;
  experience?: string;
  formation?: string;
}> = {
  1: {
    id: 1,
    nom: 'Mensah',
    prenom: 'Kodjo',
    email: 'kodjo.mensah@email.com',
    telephone: '+228 90 11 22 33',
    poste: 'Développeur Full Stack',
    date: '14/01/2025',
    status: 'ENTRETIEN',
    type: 'CDI',
    cvFile: 'CV_Kodjo_Mensah.pdf',
    lettreFile: 'Lettre_Motivation.pdf',
    description: 'Développeur passionné avec 5 ans d\'expérience en développement web.',
    experience: '5 ans en développement Full Stack',
    formation: 'Bac+5 en Informatique',
  },
  2: {
    id: 2,
    nom: 'Gnammi',
    prenom: 'Akossiwa',
    email: 'akossiwa.gnammi@email.com',
    telephone: '+228 91 22 33 44',
    poste: 'Stage – Analyste Business',
    date: '12/01/2025',
    status: 'EN_COURS',
    type: 'Stage',
    cvFile: 'CV_Akossiwa_Gnammi.pdf',
    lettreFile: null,
    description: 'Étudiante en fin d\'études motivée par l\'analyse business.',
    experience: '2 stages en entreprise',
    formation: 'Bac+3 en Gestion',
  },
  3: {
    id: 3,
    nom: 'Agbemadon',
    prenom: 'Yao',
    email: 'yao.agbemadon@email.com',
    telephone: '+228 92 33 44 55',
    poste: 'Chargé(e) de Communication',
    date: '13/01/2025',
    status: 'EN_ATTENTE',
    type: 'CDI',
    cvFile: 'CV_Yao_Agbemadon.pdf',
    lettreFile: 'Lettre_Motivation.pdf',
    description: 'Professionnel de la communication avec 3 ans d\'expérience.',
    experience: '3 ans en communication digitale',
    formation: 'Bac+4 en Communication',
  },
  4: {
    id: 4,
    nom: 'Dzivaguru',
    prenom: 'Afi',
    email: 'afi.dzivaguru@email.com',
    telephone: '+228 93 44 55 66',
    poste: 'Commercial Terrain',
    date: '11/01/2025',
    status: 'ACCEPTE',
    type: 'CDD',
    cvFile: 'CV_Afi_Dzivaguru.pdf',
    lettreFile: 'Lettre_Motivation.pdf',
    description: 'Commerciale dynamique avec expérience terrain.',
    experience: '4 ans en vente terrain',
    formation: 'Bac+2 en Commerce',
  },
  5: {
    id: 5,
    nom: 'Tossou',
    prenom: 'Kwame',
    email: 'kwame.tossou@email.com',
    telephone: '+228 94 55 66 77',
    poste: 'Stage – Designer UX/UI',
    date: '15/01/2025',
    status: 'REFUSE',
    type: 'Stage',
    cvFile: 'CV_Kwame_Tossou.pdf',
    lettreFile: 'Lettre_Motivation.pdf',
    description: 'Designer créatif avec un portfolio solide.',
    experience: '1 an en freelance',
    formation: 'Bac+3 en Design',
  },
  6: {
    id: 6,
    nom: 'Kpadenou',
    prenom: 'Dodzi',
    email: 'dodzi.kpadenou@email.com',
    telephone: '+228 95 66 77 88',
    poste: 'Responsable Comptable',
    date: '14/01/2025',
    status: 'EN_ATTENTE',
    type: 'CDI',
    cvFile: 'CV_Dodzi_Kpadenou.pdf',
    lettreFile: 'Lettre_Motivation.pdf',
    description: 'Expert comptable avec expérience en gestion financière.',
    experience: '6 ans en comptabilité',
    formation: 'Bac+5 en Comptabilité',
  },
};

function StatusBadge({ status }: { status: CandidatureStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {style.label}
    </span>
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${COLORS.yellow}33` }}
        >
          <Icon size={20} style={{ color: COLORS.midnight }} aria-hidden="true" />
        </div>
        <h2 className="text-lg font-bold" style={{ color: COLORS.midnight }}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

export default function RHCandidatureDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const candidatureId = Number(id);

  const candidature = MOCK_CANDIDATURES[candidatureId];

  if (!candidature) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Candidature non trouvée</h2>
          <p className="text-gray-600 mb-6">La candidature que vous recherchez n'existe pas.</p>
          <Link
            href="/rh/candidatures"
            className="inline-flex items-center gap-2 px-6 py-3 font-bold rounded-lg transition-all hover:opacity-90 shadow-sm"
            style={{ backgroundColor: COLORS.yellow, color: COLORS.midnight }}
          >
            <ArrowLeft size={18} />
            Retour aux candidatures
          </Link>
        </div>
      </div>
    );
  }

  const handleAccept = () => {
    alert('Candidature acceptée - fonctionnalité à implémenter avec le backend');
  };

  const handleReject = () => {
    alert('Candidature refusée - fonctionnalité à implémenter avec le backend');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Lien retour */}
        <Link
          href="/rh/candidatures"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Retour aux candidatures
        </Link>

        {/* En-tête */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white"
              style={{ backgroundColor: COLORS.midnight }}
            >
              {candidature.prenom.charAt(0).toUpperCase()}
            </div>

            {/* Informations */}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: COLORS.midnight }}>
                {candidature.prenom} {candidature.nom}
              </h1>
              <p className="text-gray-600 mb-4">{candidature.poste}</p>
              <StatusBadge status={candidature.status} />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleAccept}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: COLORS.midnight }}
              >
                <Check size={18} />
                Accepter
              </button>
              <button
                onClick={handleReject}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-red-600 border border-red-200 bg-red-50 transition-opacity hover:opacity-90"
              >
                <X size={18} />
                Refuser
              </button>
            </div>
          </div>
        </div>

        {/* Informations personnelles */}
        <SectionCard icon={User} title="Informations personnelles">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500 mb-1">Nom</p>
                <p className="font-semibold text-gray-900">{candidature.nom}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Prénoms</p>
                <p className="font-semibold text-gray-900">{candidature.prenom}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500 mb-1">E-mail</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  {candidature.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Téléphone</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  {candidature.telephone}
                </p>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Parcours */}
        <SectionCard icon={Briefcase} title="Parcours">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Expérience</p>
              <p className="font-semibold text-gray-900">{candidature.experience}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Formation</p>
              <p className="font-semibold text-gray-900">{candidature.formation}</p>
            </div>
          </div>
        </SectionCard>

        {/* Documents */}
        <SectionCard icon={FileText} title="Documents">
          <div className="space-y-3">
            {candidature.cvFile && (
              <div className="flex items-center justify-between rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{candidature.cvFile}</p>
                    <p className="text-xs text-gray-500">PDF · 2.4 MB</p>
                  </div>
                </div>
                <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <Download size={16} />
                  Télécharger
                </button>
              </div>
            )}
            {candidature.lettreFile && (
              <div className="flex items-center justify-between rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{candidature.lettreFile}</p>
                    <p className="text-xs text-gray-500">PDF · 1.2 MB</p>
                  </div>
                </div>
                <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <Download size={16} />
                  Télécharger
                </button>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Description */}
        {candidature.description && (
          <SectionCard icon={Briefcase} title="Description du candidat">
            <p className="text-gray-700 leading-relaxed">{candidature.description}</p>
          </SectionCard>
        )}

        {/* Informations candidature */}
        <SectionCard icon={Calendar} title="Informations de la candidature">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500 mb-1">Date de candidature</p>
                <p className="font-semibold text-gray-900">{candidature.date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Type de contrat</p>
                <p className="font-semibold text-gray-900">{candidature.type}</p>
              </div>
            </div>
          </div>
        </SectionCard>
      </main>
    </div>
  );
}
