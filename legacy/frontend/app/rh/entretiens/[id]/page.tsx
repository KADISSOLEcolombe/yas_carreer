'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Video, User, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../../../../lib/api';

const COLORS = {
  midnight: '#00377D',
  yellow: '#FFD100',
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
}

interface Entretien {
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
  notes?: string;
  lien_meeting?: string;
  plateforme?: string;
}

const STATUS_STYLES: Record<EntretienStatus, { bg: string; text: string; label: string; icon: React.ElementType }> = {
  PLANIFIE: { bg: '#FEF3C7', text: '#92400E', label: 'Planifié', icon: AlertCircle },
  TERMINE: { bg: '#D1FAE5', text: '#065F46', label: 'Terminé', icon: CheckCircle },
  ANNULE: { bg: '#FEE2E2', text: '#DC2626', label: 'Annulé', icon: XCircle },
};

function mapApiEntretien(apiEntretien: ApiEntretien): Entretien {
  const dateObj = new Date(apiEntretien.date);
  const date = dateObj.toLocaleDateString('fr-FR');
  const heure = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const avec = apiEntretien.utilisateur_entretien_utilisateurrh_idToutilisateur
    ? `${apiEntretien.utilisateur_entretien_utilisateurrh_idToutilisateur.prenom} ${apiEntretien.utilisateur_entretien_utilisateurrh_idToutilisateur.nom}`
    : 'Non assigné';
  const duree = apiEntretien.duree ? `${apiEntretien.duree} min` : 'Non spécifié';

  return {
    id: apiEntretien.id,
    candidat: `${apiEntretien.candidature.utilisateur.prenom} ${apiEntretien.candidature.utilisateur.nom}`,
    poste: apiEntretien.candidature.offre.titre,
    date,
    heure,
    duree,
    avec,
    type: apiEntretien.type,
    statut: apiEntretien.statut,
    email: apiEntretien.candidature.utilisateur.email,
    notes: apiEntretien.commentaire || undefined,
    lien_meeting: apiEntretien.lien_meeting || undefined,
    plateforme: apiEntretien.plateforme || undefined,
  };
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
  const [entretien, setEntretien] = useState<Entretien | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEntretien = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const apiEntretien = await api.getEntretienById(Number(id));
        const mappedEntretien = mapApiEntretien(apiEntretien);
        setEntretien(mappedEntretien);
      } catch (err: any) {
        console.error('Erreur lors du chargement de l\'entretien:', err);
        if (err.status === 404) {
          setError('Entretien introuvable');
        } else {
          setError(err.message || 'Impossible de charger l\'entretien');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadEntretien();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: COLORS.midnight }} />
      </div>
    );
  }

  if (error || !entretien) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error === 'Entretien introuvable' ? 'Entretien non trouvé' : 'Erreur de chargement'}
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'Impossible de charger les détails de l\'entretien.'}
          </p>
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

  const handleAnnuler = async () => {
    if (!entretien) return;
    try {
      await api.deleteEntretien(entretien.id);
      router.push('/rh/entretiens');
    } catch (err: any) {
      console.error('Erreur lors de l\'annulation:', err);
      alert(err.message || 'Erreur lors de l\'annulation');
    }
  };

  const handleCompleter = async () => {
    if (!entretien) return;
    try {
      await api.updateEntretien(entretien.id, { statut: 'TERMINE' });
      // Recharger l'entretien
      const apiEntretien = await api.getEntretienById(entretien.id);
      const mappedEntretien = mapApiEntretien(apiEntretien);
      setEntretien(mappedEntretien);
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour:', err);
      alert(err.message || 'Erreur lors de la mise à jour');
    }
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
                  {entretien.type === 'visio' ? 'Visio' : 'Présentiel'}
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
                  {entretien.type === 'visio' ? (
                    <Video size={16} className="text-gray-400" />
                  ) : (
                    <MapPin size={16} className="text-gray-400" />
                  )}
                  {entretien.type === 'visio' ? 'Visio' : 'Présentiel'}
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

            {entretien.type === 'visio' && entretien.lien_meeting && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Lien de visioconférence</p>
                <a
                  href={entretien.lien_meeting}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-2"
                >
                  <Video size={16} />
                  Rejoindre la réunion
                </a>
              </div>
            )}

            {/* Adresse - non disponible en base pour l'instant */}
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
            {/* Téléphone - non disponible en base pour l'instant */}
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
