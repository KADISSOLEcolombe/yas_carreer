'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Video, User, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const COLORS = {
  midnight: '#1e3a8a',
  yellow: '#facc15',
};

type EntretienType = 'Présentiel' | 'Visio';
type EntretienStatus = 'PLANIFIE' | 'TERMINE' | 'ANNULE';

const STATUS_STYLES: Record<EntretienStatus, { bg: string; text: string; label: string; icon: React.ElementType }> = {
  PLANIFIE: { bg: '#FEF3C7', text: '#92400E', label: 'Planifié', icon: AlertCircle },
  TERMINE: { bg: '#D1FAE5', text: '#065F46', label: 'Terminé', icon: CheckCircle },
  ANNULE: { bg: '#FEE2E2', text: '#DC2626', label: 'Annulé', icon: XCircle },
};

// TODO : à remplacer par les vraies données quand le backend sera connecté
const MOCK_ENTRETIENS: Record<number, {
  id: number;
  candidat: string;
  poste: string;
  date: string;
  heure: string;
  duree: string;
  avec: string;
  type: EntretienType;
  statut: EntretienStatus;
  email?: string;
  telephone?: string;
  notes?: string;
  lienVisio?: string;
  adresse?: string;
}> = {
  1: {
    id: 1,
    candidat: 'Kodjo Mensah',
    poste: 'Développeur Full Stack',
    date: '21/01/2025',
    heure: '10:00',
    duree: '1h',
    avec: 'Marie Dupont',
    type: 'Présentiel',
    statut: 'PLANIFIE',
    email: 'kodjo.mensah@email.com',
    telephone: '+228 90 11 22 33',
    notes: 'Premier entretien technique',
    adresse: 'Bureau YAS Togo, Lomé',
  },
  2: {
    id: 2,
    candidat: 'Akossiwa Gnammi',
    poste: 'Stage – Analyste Business',
    date: '22/01/2025',
    heure: '14:30',
    duree: '45min',
    avec: 'Jean Agbo',
    type: 'Visio',
    statut: 'PLANIFIE',
    email: 'akossiwa.gnammi@email.com',
    telephone: '+228 91 22 33 44',
    notes: 'Entretien avec le responsable du stage',
    lienVisio: 'https://meet.google.com/abc-defg-hij',
  },
  3: {
    id: 3,
    candidat: 'Yao Agbemadon',
    poste: 'Chargé(e) de Communication',
    date: '19/01/2025',
    heure: '09:00',
    duree: '1h',
    avec: 'Marie Dupont',
    type: 'Visio',
    statut: 'TERMINE',
    email: 'yao.agbemadon@email.com',
    telephone: '+228 92 33 44 55',
    notes: 'Entretien très positif, candidature à retenir',
    lienVisio: 'https://meet.google.com/xyz-uvwx-yz',
  },
};

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

function StatusBadge({ status }: { status: EntretienStatus }) {
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

export default function RHEntretienDetailPage() {
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
            href="/rh/entretiens"
            className="inline-flex items-center gap-2 px-6 py-3 font-bold rounded-lg transition-all hover:opacity-90 shadow-sm"
            style={{ backgroundColor: COLORS.yellow, color: COLORS.midnight }}
          >
            <ArrowLeft size={18} />
            Retour aux entretiens
          </Link>
        </div>
      </div>
    );
  }

  const handleAnnuler = () => {
    alert('Annulation de l\'entretien - fonctionnalité à implémenter avec le backend');
  };

  const handleCompleter = () => {
    alert('Marquer comme terminé - fonctionnalité à implémenter avec le backend');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Lien retour */}
        <Link
          href="/rh/entretiens"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Retour aux entretiens
        </Link>

        {/* En-tête */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white"
              style={{ backgroundColor: COLORS.midnight }}
            >
              {entretien.candidat.charAt(0).toUpperCase()}
            </div>

            {/* Informations */}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: COLORS.midnight }}>
                {entretien.candidat}
              </h1>
              <p className="text-gray-600 mb-4">{entretien.poste}</p>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={entretien.statut} />
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                  {entretien.type}
                </span>
              </div>
            </div>

            {/* Actions */}
            {entretien.statut === 'PLANIFIE' && (
              <div className="flex gap-2">
                <button
                  onClick={handleAnnuler}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-red-600 border border-red-200 bg-red-50 transition-opacity hover:opacity-90"
                >
                  <XCircle size={18} />
                  Annuler
                </button>
                <button
                  onClick={handleCompleter}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: COLORS.midnight }}
                >
                  <CheckCircle size={18} />
                  Terminer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Informations de l'entretien */}
        <SectionCard icon={Calendar} title="Informations de l'entretien">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500 mb-1">Date</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  {entretien.date}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Heure</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  {entretien.heure}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500 mb-1">Durée</p>
                <p className="font-semibold text-gray-900">{entretien.duree}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Type</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  {entretien.type === 'Visio' ? (
                    <Video size={16} className="text-gray-400" />
                  ) : (
                    <MapPin size={16} className="text-gray-400" />
                  )}
                  {entretien.type}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Entretien avec</p>
              <p className="font-semibold text-gray-900 flex items-center gap-2">
                <User size={16} className="text-gray-400" />
                {entretien.avec}
              </p>
            </div>

            {entretien.type === 'Visio' && entretien.lienVisio && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Lien de visioconférence</p>
                <a
                  href={entretien.lienVisio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-2"
                >
                  <Video size={16} />
                  Rejoindre la réunion
                </a>
              </div>
            )}

            {entretien.type === 'Présentiel' && entretien.adresse && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Adresse</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  {entretien.adresse}
                </p>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Informations du candidat */}
        <SectionCard icon={User} title="Informations du candidat">
          <div className="space-y-4">
            {entretien.email && (
              <div>
                <p className="text-sm text-gray-500 mb-1">E-mail</p>
                <p className="font-semibold text-gray-900">{entretien.email}</p>
              </div>
            )}
            {entretien.telephone && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Téléphone</p>
                <p className="font-semibold text-gray-900">{entretien.telephone}</p>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Notes */}
        {entretien.notes && (
          <SectionCard icon={Calendar} title="Notes">
            <p className="text-gray-700 leading-relaxed">{entretien.notes}</p>
          </SectionCard>
        )}
      </main>
    </div>
  );
}
