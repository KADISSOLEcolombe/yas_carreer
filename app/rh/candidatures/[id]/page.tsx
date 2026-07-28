'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Briefcase, Calendar, MapPin, Phone, Mail, FileText, Download, Check, X, UserCog, Clock } from 'lucide-react';
import { api, mapCandidature, mapStatusToBackend, type Application } from '../../../../lib/api';

const COLORS = {
  midnight: '#1e3a8a',
  yellow: '#facc15',
};

const STATUS_STYLES: Record<Application['status'], { bg: string; text: string; label: string }> = {
  PENDING: { bg: '#FEF3C7', text: '#92400E', label: 'En attente' },
  IN_REVIEW: { bg: '#DBEAFE', text: '#1E40AF', label: 'En examen' },
  INTERVIEW: { bg: '#EDE9FE', text: '#6D28D9', label: 'Entretien' },
  ACCEPTED: { bg: '#D1FAE5', text: '#065F46', label: 'Accepté' },
  REJECTED: { bg: '#FEE2E2', text: '#DC2626', label: 'Refusé' },
};

function StatusBadge({ status }: { status: Application['status'] }) {
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
  const [application, setApplication] = useState<Application | null>(null);
  const [files, setFiles] = useState<{ id: number; libelle: string; chemin: string; extension: string; id_candidature: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emploi, setEmploi] = useState<any | null>(null);
  const [departements, setDepartements] = useState<Array<{ id: number; nom: string }>>([]);
  const [superviseurs, setSuperviseurs] = useState<Array<{ id: number; nom: string; prenom: string; email: string }>>([]);
  const [isAffectationModalOpen, setIsAffectationModalOpen] = useState(false);
  const [affectationForm, setAffectationForm] = useState({
    sujet: '',
    lieu: '',
    date_debut: '',
    date_fin: '',
    id_departement: '',
    utilisateursup_id: '',
  });
  const [isSubmittingAffectation, setIsSubmittingAffectation] = useState(false);
  const [affectationError, setAffectationError] = useState<string | null>(null);

  useEffect(() => {
    const loadApplication = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const apiCandidature = await api.getApplicationById(Number(id));
        const mappedApplication = mapCandidature(apiCandidature);
        setApplication(mappedApplication);
        
        // Charger les fichiers de la candidature
        const fichiers = await api.getFilesByCandidature(Number(id));
        setFiles(fichiers);

        // Si acceptée, vérifier si une affectation existe déjà, sinon préparer le formulaire
        if (mappedApplication.status === 'ACCEPTED') {
          const [emplois, deps, sups] = await Promise.all([
            api.getEmplois(),
            api.getDepartements(),
            api.getSuperviseurs(),
          ]);
          const existant = emplois.find((e: any) => e.can_id === Number(id));
          setEmploi(existant || null);
          setDepartements(deps);
          setSuperviseurs(sups);
        }
      } catch (err: any) {
        console.error('Erreur lors du chargement de la candidature:', err);
        if (err.status === 404) {
          setError('Candidature introuvable');
        } else {
          setError(err.message || 'Impossible de charger la candidature');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadApplication();
  }, [id]);

  const handleChangeStatus = async (status: Application['status']) => {
    if (!application) return;
    try {
      await api.updateApplicationStatus(Number(application.id), mapStatusToBackend(status));
      // Recharger la candidature
      const apiCandidature = await api.getApplicationById(Number(application.id));
      const mappedApplication = mapCandidature(apiCandidature);
      setApplication(mappedApplication);
    } catch (err: any) {
      console.error('Erreur lors du changement de statut:', err);
      alert(err.message || 'Erreur lors du changement de statut');
    }
  };

  const handleOpenAffectationModal = () => {
    setAffectationForm({ sujet: '', lieu: '', date_debut: '', date_fin: '', id_departement: '', utilisateursup_id: '' });
    setAffectationError(null);
    setIsAffectationModalOpen(true);
  };

  const handleSubmitAffectation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application) return;
    setIsSubmittingAffectation(true);
    setAffectationError(null);
    try {
      const nouvelEmploi = await api.createEmploi({
        can_id: Number(application.id),
        id_departement: Number(affectationForm.id_departement),
        date_debut: affectationForm.date_debut,
        date_fin: affectationForm.date_fin,
        sujet: affectationForm.sujet,
        lieu: affectationForm.lieu,
        utilisateursup_id: affectationForm.utilisateursup_id ? Number(affectationForm.utilisateursup_id) : undefined,
      });
      setEmploi(nouvelEmploi);
      setIsAffectationModalOpen(false);
    } catch (err: any) {
      setAffectationError(err.message || "Erreur lors de la création de l'affectation");
    } finally {
      setIsSubmittingAffectation(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: COLORS.midnight }} />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error === 'Candidature introuvable' ? 'Candidature non trouvée' : 'Erreur de chargement'}
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'Impossible de charger les détails de la candidature.'}
          </p>
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
              {application.nom.charAt(0).toUpperCase()}
            </div>

            {/* Informations */}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: COLORS.midnight }}>
                {application.nom}
              </h1>
              <p className="text-gray-600 mb-4">{application.jobTitle}</p>
              <div className="flex items-center gap-2">
                <StatusBadge status={application.status} />
                {application.score != null && (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                    style={
                      application.score >= 70
                        ? { backgroundColor: '#D1FAE5', color: '#065F46' }
                        : application.score >= 40
                        ? { backgroundColor: '#FEF3C7', color: '#92400E' }
                        : { backgroundColor: '#FEE2E2', color: '#DC2626' }
                    }
                  >
                    {application.score}% compatible
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleChangeStatus('PENDING')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-yellow-700 border border-yellow-200 bg-yellow-50 transition-opacity hover:opacity-90"
              >
                <Clock size={18} />
                En attente
              </button>
              <button
                onClick={() => handleChangeStatus('IN_REVIEW')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-blue-700 border border-blue-200 bg-blue-50 transition-opacity hover:opacity-90"
              >
                En examen
              </button>
              <button
                onClick={() => handleChangeStatus('ACCEPTED')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: COLORS.midnight }}
              >
                <Check size={18} />
                Accepter
              </button>
              <button
                onClick={() => handleChangeStatus('REJECTED')}
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
            <div>
              <p className="text-sm text-gray-500 mb-1">Nom</p>
              <p className="font-semibold text-gray-900">{application.nom}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500 mb-1">E-mail</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  {application.email}
                </p>
              </div>
              {application.telephone && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Téléphone</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" />
                    {application.telephone}
                  </p>
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* Documents */}
        <SectionCard icon={FileText} title="Documents">
          <div className="space-y-4">
            {files.length === 0 ? (
              <p className="text-gray-500">Aucun document disponible</p>
            ) : (
              files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{file.libelle}</p>
                      <p className="text-sm text-gray-500">{file.extension.toUpperCase()}</p>
                    </div>
                  </div>
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${file.chemin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Télécharger
                  </a>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        {/* Informations candidature */}
        <SectionCard icon={Calendar} title="Informations de la candidature">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Date de candidature</p>
              <p className="font-semibold text-gray-900">{new Date(application.createdAt).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </SectionCard>

        {/* Affectation (stage/CDI/CDD) — uniquement si la candidature est acceptée */}
        {application.status === 'ACCEPTED' && (
          <SectionCard icon={UserCog} title="Affectation">
            {emploi ? (
              <div className="space-y-2">
                <p className="font-semibold text-gray-900">{emploi.sujet}</p>
                <p className="text-sm text-gray-600">
                  {emploi.lieu} · {emploi.departement?.nom} · du {new Date(emploi.date_debut).toLocaleDateString('fr-FR')} au {new Date(emploi.date_fin).toLocaleDateString('fr-FR')}
                </p>
                <p className="text-sm text-gray-600">
                  Superviseur : {emploi.utilisateur ? `${emploi.utilisateur.prenom} ${emploi.utilisateur.nom}` : 'Non assigné'}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500 mb-4">
                  Aucune affectation créée. Le superviseur ne pourra pas évaluer ce candidat tant que ce n&apos;est pas fait.
                </p>
                <button
                  onClick={handleOpenAffectationModal}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: COLORS.midnight }}
                >
                  <UserCog size={18} />
                  Créer l&apos;affectation
                </button>
              </div>
            )}
          </SectionCard>
        )}
      </main>

      {/* Modale de création d'affectation */}
      {isAffectationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Créer l&apos;affectation</h2>
              <button
                onClick={() => setIsAffectationModalOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitAffectation} className="p-6 space-y-4">
              {affectationError && (
                <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-md">
                  {affectationError}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Sujet / intitulé *</label>
                <input
                  required
                  value={affectationForm.sujet}
                  onChange={(e) => setAffectationForm({ ...affectationForm, sujet: e.target.value })}
                  placeholder="Ex: Stage développement front-end"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Lieu *</label>
                <input
                  required
                  value={affectationForm.lieu}
                  onChange={(e) => setAffectationForm({ ...affectationForm, lieu: e.target.value })}
                  placeholder="Ex: Lomé"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Date de début *</label>
                  <input
                    required
                    type="date"
                    value={affectationForm.date_debut}
                    onChange={(e) => setAffectationForm({ ...affectationForm, date_debut: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Date de fin *</label>
                  <input
                    required
                    type="date"
                    value={affectationForm.date_fin}
                    onChange={(e) => setAffectationForm({ ...affectationForm, date_fin: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Département *</label>
                <select
                  required
                  value={affectationForm.id_departement}
                  onChange={(e) => setAffectationForm({ ...affectationForm, id_departement: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                >
                  <option value="">Sélectionner un département</option>
                  {departements.map((dep) => (
                    <option key={dep.id} value={dep.id}>{dep.nom}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Superviseur</label>
                <select
                  value={affectationForm.utilisateursup_id}
                  onChange={(e) => setAffectationForm({ ...affectationForm, utilisateursup_id: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                >
                  <option value="">Aucun pour l&apos;instant</option>
                  {superviseurs.map((sup) => (
                    <option key={sup.id} value={sup.id}>{sup.prenom} {sup.nom}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAffectationModalOpen(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAffectation}
                  className="flex-1 rounded-lg px-4 py-2 text-sm font-bold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                  style={{ backgroundColor: COLORS.midnight }}
                >
                  {isSubmittingAffectation ? 'Création...' : "Créer l'affectation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
