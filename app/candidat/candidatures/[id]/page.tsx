'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Briefcase, Calendar, FileText, Clock, MapPin, Building2, XCircle } from 'lucide-react';
import { COLORS } from '../../../../app/profil/page';

type CandidatureStatus = 'ENTRETIEN' | 'EN_COURS' | 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE';
type ContractType = 'CDI' | 'CDD' | 'Stage';

const STATUS_STYLES: Record<CandidatureStatus, { bg: string; text: string; label: string }> = {
  ENTRETIEN: { bg: '#EDE9FE', text: '#6D28D9', label: 'Entretien planifié' },
  EN_COURS: { bg: '#DBEAFE', text: '#1E40AF', label: 'En cours' },
  EN_ATTENTE: { bg: '#FEF3C7', text: '#92400E', label: 'En attente' },
  ACCEPTEE: { bg: '#D1FAE5', text: '#065F46', label: 'Acceptée' },
  REFUSEE: { bg: '#FEE2E2', text: '#DC2626', label: 'Refusée' },
};

// TODO : à remplacer par les vraies données quand le backend sera connecté
const MOCK_CANDIDATURES: Record<number, {
  id: number;
  poste: string;
  date: string;
  status: CandidatureStatus;
  type: ContractType;
  entreprise: string;
  departement?: string;
  description?: string;
  cvFile?: string;
  lettreFile?: string;
  entretien?: {
    date: string;
    heure: string;
    avec: string;
    type: 'Présentiel' | 'Visio';
  };
}> = {
  1: {
    id: 1,
    poste: 'Développeur Full Stack',
    date: '14/01/2025',
    status: 'ENTRETIEN',
    type: 'CDI',
    entreprise: 'YAS Togo',
    departement: 'Informatique',
    description: 'Nous recherchons un développeur Full Stack expérimenté pour rejoindre notre équipe technique. Vous serez responsable de la conception et du développement de nos applications web.',
    cvFile: 'Curriculum_Vitae.pdf',
    lettreFile: 'Lettre_Motivation.pdf',
    entretien: {
      date: '21/01/2025',
      heure: '10:00',
      avec: 'Marie Dupont',
      type: 'Présentiel',
    },
  },
  2: {
    id: 2,
    poste: 'Stage – Analyste Business',
    date: '12/01/2025',
    status: 'EN_COURS',
    type: 'Stage',
    entreprise: 'Digital Solutions',
    departement: 'Marketing',
    description: 'Stage en analyse business pour participer à l\'étude de marché et à l\'analyse des données commerciales.',
    cvFile: 'Curriculum_Vitae.pdf',
    lettreFile: null,
  },
  3: {
    id: 3,
    poste: 'Chargé(e) de Communication',
    date: '13/01/2025',
    status: 'EN_ATTENTE',
    type: 'CDI',
    entreprise: 'Tech Africa',
    departement: 'Communication',
    description: 'Chargé de communication pour gérer les relations presse et les campagnes de communication.',
    cvFile: 'Curriculum_Vitae.pdf',
    lettreFile: 'Lettre_Motivation.pdf',
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
  else if (status === 'REFUSEE') etapeCourante = -1;

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

            return (
              <div key={etape.key} className="flex flex-col items-center">
                <div className="relative flex w-full items-center justify-center">
                  {index > 0 && (
                    <div
                      className={`absolute left-0 right-1/2 h-0.5 ${
                        estPasse ? 'bg-yellow-400' : 'bg-gray-200'
                      }`}
                      aria-hidden="true"
                    />
                  )}
                  {index < etapes.length - 1 && (
                    <div
                      className={`absolute left-1/2 right-0 h-0.5 ${
                        estPasse || estCourant ? 'bg-yellow-400' : 'bg-gray-200'
                      }`}
                      aria-hidden="true"
                    />
                  )}
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

export default function CandidatureDetailPage() {
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
            href="/profil"
            className="inline-flex items-center gap-2 px-6 py-3 font-bold rounded-lg transition-all hover:opacity-90 shadow-sm"
            style={{ backgroundColor: COLORS.yellow, color: COLORS.midnight }}
          >
            <ArrowLeft size={18} />
            Retour à mes candidatures
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Lien retour */}
        <Link
          href="/profil"
          onClick={() => router.push('/profil')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Retour à mes candidatures
        </Link>

        {/* En-tête */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4" style={{ color: COLORS.midnight }}>
            {candidature.poste}
          </h1>
          
          {/* Ligne d'infos */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mb-4">
            {candidature.departement && (
              <span className="inline-flex items-center gap-2">
                <Building2 size={16} className="shrink-0" style={{ color: COLORS.midnight }} aria-hidden="true" />
                {candidature.departement}
              </span>
            )}
            <span className="inline-flex items-center gap-2">
              <Briefcase size={16} className="shrink-0" style={{ color: COLORS.midnight }} aria-hidden="true" />
              {candidature.type}
            </span>
            <span className="inline-flex items-center gap-2">
              <Calendar size={16} className="shrink-0" style={{ color: COLORS.midnight }} aria-hidden="true" />
              Candidature le {candidature.date}
            </span>
          </div>

          {/* Badge de statut */}
          <div className="mb-6">
            <StatusBadge status={candidature.status} />
          </div>

          {/* Frise de progression */}
          <ProgressionFrise status={candidature.status} />
        </div>

        {/* Description du poste */}
        {candidature.description && (
          <SectionCard icon={Briefcase} title="Description du poste">
            <p className="text-gray-700 leading-relaxed">{candidature.description}</p>
          </SectionCard>
        )}

        {/* Mes documents */}
        <SectionCard icon={FileText} title="Mes documents">
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
                <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
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
                <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                  Télécharger
                </button>
              </div>
            )}
            {!candidature.cvFile && !candidature.lettreFile && (
              <p className="text-sm text-gray-500">Aucun document disponible.</p>
            )}
          </div>
        </SectionCard>

        {/* Entretien */}
        {candidature.entretien && (
          <SectionCard icon={Clock} title="Entretien">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: '#F3F4F6', color: COLORS.midnight }}>
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{candidature.entretien.date} à {candidature.entretien.heure}</p>
                  <p className="text-sm text-gray-600">Avec {candidature.entretien.avec}</p>
                  <p className="text-sm text-gray-600">{candidature.entretien.type}</p>
                </div>
              </div>
              <Link
                href="#"
                className="inline-flex items-center gap-2 text-sm font-semibold"
                style={{ color: COLORS.midnight }}
              >
                Voir le détail de l'entretien
                <ArrowLeft size={14} className="rotate-180" />
              </Link>
            </div>
          </SectionCard>
        )}
      </main>
    </div>
  );
}
