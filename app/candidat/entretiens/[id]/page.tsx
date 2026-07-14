'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Video, User, ExternalLink, Clock, Briefcase } from 'lucide-react';

const COLORS = {
  midnight: '#1e3a8a',
  yellow: '#facc15',
};

type EntretienStatus = 'A_VENIR' | 'TERMINE' | 'ANNULE';
type EntretienType = 'Présentiel' | 'Visio';

const STATUS_STYLES: Record<EntretienStatus, { bg: string; text: string; label: string }> = {
  A_VENIR: { bg: '#D1FAE5', text: '#065F46', label: 'À venir' },
  TERMINE: { bg: '#E5E7EB', text: '#374151', label: 'Terminé' },
  ANNULE: { bg: '#FEE2E2', text: '#DC2626', label: 'Annulé' },
};

// TODO : à remplacer par les vraies données quand le backend sera connecté
// Champs manquants en base :
// - utilisateur.fonction (poste de l'intervieweur)
// - utilisateur.photo (photo de l'intervieweur)
const DONNEES_PROVISOIRES = {
  intervieweurs: {
    1: {
      id: 1,
      nom: 'Dupont',
      prenom: 'Marie',
      fonction: 'Responsable Recrutement', // TODO : champ absent en base
      departement: 'Ressources Humaines',
      photo: null, // TODO : champ absent en base
    },
    2: {
      id: 2,
      nom: 'Koffi',
      prenom: 'Kwame',
      fonction: 'Lead Developer', // TODO : champ absent en base
      departement: 'Informatique',
      photo: null, // TODO : champ absent en base
    },
    3: {
      id: 3,
      nom: 'Mensah',
      prenom: 'Amina',
      fonction: 'Directrice Marketing', // TODO : champ absent en base
      departement: 'Marketing',
      photo: null, // TODO : champ absent en base
    },
  },
};

const MOCK_ENTRETIENS: Record<number, {
  id: number;
  poste: string;
  date: string;
  heure: string;
  status: EntretienStatus;
  type: EntretienType;
  lieu?: string;
  lienVisio?: string;
  plateforme?: string;
  duree?: number;
  candidatureId: number;
  intervieweurId: number;
}> = {
  1: {
    id: 1,
    poste: 'Développeur Full Stack',
    date: '21/01/2025',
    heure: '10:00',
    status: 'A_VENIR',
    type: 'Présentiel',
    lieu: 'Salle de conférence A, YAS Togo, Lomé',
    duree: 60,
    candidatureId: 1,
    intervieweurId: 1,
  },
  2: {
    id: 2,
    poste: 'Stage – Analyste Business',
    date: '22/01/2025',
    heure: '14:30',
    status: 'A_VENIR',
    type: 'Visio',
    lienVisio: 'https://meet.google.com/abc-defg-hij',
    plateforme: 'Google Meet',
    duree: 45,
    candidatureId: 2,
    intervieweurId: 2,
  },
  3: {
    id: 3,
    poste: 'Chargé(e) de Communication',
    date: '23/01/2025',
    heure: '09:00',
    status: 'A_VENIR',
    type: 'Visio',
    lienVisio: 'https://zoom.us/j/123456789',
    plateforme: 'Zoom',
    duree: 30,
    candidatureId: 3,
    intervieweurId: 3,
  },
};

function StatusBadge({ status }: { status: EntretienStatus }) {
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

function IntervieweurCard({ intervieweur }: { intervieweur: typeof DONNEES_PROVISOIRES.intervieweurs[keyof typeof DONNEES_PROVISOIRES.intervieweurs] }) {
  const initiale = intervieweur.prenom.charAt(0).toUpperCase();

  return (
    <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-bold mb-5" style={{ color: COLORS.midnight }}>
        Votre intervieweur
      </h2>
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white"
          style={{ backgroundColor: COLORS.midnight }}
        >
          {intervieweur.photo ? (
            <img
              src={intervieweur.photo}
              alt={`${intervieweur.prenom} ${intervieweur.nom}`}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            initiale
          )}
        </div>

        {/* Informations */}
        <div className="flex-1">
          <p className="text-lg font-bold text-gray-900">
            {intervieweur.prenom} {intervieweur.nom}
          </p>
          <p className="text-sm font-semibold text-gray-600 mt-1">
            {intervieweur.fonction}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {intervieweur.departement}
          </p>
        </div>
      </div>
    </section>
  );
}

export default function EntretienDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const entretienId = Number(id);

  const entretien = MOCK_ENTRETIENS[entretienId];

  if (!entretien) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Entretien non trouvé</h2>
          <p className="text-gray-600 mb-6">L'entretien que vous recherchez n'existe pas.</p>
          <Link
            href="/profil"
            className="inline-flex items-center gap-2 px-6 py-3 font-bold rounded-lg transition-all hover:opacity-90 shadow-sm"
            style={{ backgroundColor: COLORS.yellow, color: COLORS.midnight }}
          >
            <ArrowLeft size={18} />
            Retour à mes entretiens
          </Link>
        </div>
      </div>
    );
  }

  const intervieweur = DONNEES_PROVISOIRES.intervieweurs[entretien.intervieweurId];

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
          Retour à mes entretiens
        </Link>

        {/* En-tête */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4" style={{ color: COLORS.midnight }}>
            {entretien.poste}
          </h1>
          
          {/* Badge de statut */}
          <div className="mb-4">
            <StatusBadge status={entretien.status} />
          </div>

          {/* Type d'entretien */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {entretien.type === 'Visio' ? (
              <Video size={16} className="shrink-0" style={{ color: COLORS.midnight }} />
            ) : (
              <MapPin size={16} className="shrink-0" style={{ color: COLORS.midnight }} />
            )}
            Entretien {entretien.type.toLowerCase()}
            {entretien.duree && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock size={14} className="shrink-0" />
                  {entretien.duree} min
                </span>
              </>
            )}
          </div>
        </div>

        {/* Carte Intervieweur - PRIORITAIRE */}
        {intervieweur && <IntervieweurCard intervieweur={intervieweur} />}

        {/* Carte Quand */}
        <SectionCard icon={Calendar} title="Quand">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: '#F3F4F6', color: COLORS.midnight }}>
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{entretien.date}</p>
                <p className="text-lg text-gray-600">à {entretien.heure}</p>
              </div>
            </div>
            {entretien.duree && (
              <p className="text-sm text-gray-500 ml-15">
                Durée estimée : {entretien.duree} minutes
              </p>
            )}
          </div>
        </SectionCard>

        {/* Carte Où */}
        <SectionCard icon={entretien.type === 'Visio' ? Video : MapPin} title="Où">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-gray-600 uppercase">
              {entretien.type}
            </p>
            {entretien.type === 'Visio' ? (
              <div className="space-y-3">
                {entretien.plateforme && (
                  <p className="text-gray-700">
                    Plateforme : <span className="font-semibold">{entretien.plateforme}</span>
                  </p>
                )}
                {entretien.lienVisio && (
                  <div>
                    <a
                      href={entretien.lienVisio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all hover:opacity-90"
                      style={{ backgroundColor: COLORS.midnight, color: 'white' }}
                    >
                      <Video size={18} />
                      Rejoindre la visio
                      <ExternalLink size={16} />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {entretien.lieu && (
                  <p className="text-gray-700">{entretien.lieu}</p>
                )}
              </div>
            )}
          </div>
        </SectionCard>

        {/* Lien vers la candidature */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <Link
            href={`/candidat/candidatures/${entretien.candidatureId}`}
            className="flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: '#F3F4F6', color: COLORS.midnight }}
              >
                <Briefcase size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Voir la candidature associée</p>
                <p className="text-xs text-gray-500">{entretien.poste}</p>
              </div>
            </div>
            <ArrowLeft size={16} className="rotate-180 text-gray-400" />
          </Link>
        </div>
      </main>
    </div>
  );
}
