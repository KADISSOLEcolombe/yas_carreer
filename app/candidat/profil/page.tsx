'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { ArrowLeft, User, Briefcase, FileText, Download, Calendar, Edit2, X, Check, MapPin, Phone, Mail, Building2 } from 'lucide-react';

const COLORS = {
  midnight: '#1e3a8a',
  yellow: '#facc15',
};

// TODO : à remplacer par les vraies données quand le backend sera connecté
// Champs manquants en base :
// - utilisateur.sexe (sexe du candidat)
// - utilisateur.ville (ville de résidence - il y a "quartier" mais pas "ville")
// - utilisateur.annees_experience (années d'expérience)
// - utilisateur.niveau_etude (niveau d'étude)
// - utilisateur.domaine_etudes (domaine d'études)
// - utilisateur.photo (photo de profil)
// - fichier.cv (CV du candidat)
const DONNEES_PROVISOIRES = {
  candidaturesCount: 3,
  entretiensCount: 2,
  cvFile: 'Curriculum_Vitae.pdf',
  // Champs manquants en base
  sexe: 'Masculin', // TODO : champ absent en base
  ville: 'Lomé', // TODO : champ absent en base (il y a "quartier" mais pas "ville")
  anneesExperience: 5, // TODO : champ absent en base
  niveauEtude: 'Bac+5', // TODO : champ absent en base
  domaineEtudes: 'Informatique', // TODO : champ absent en base
  photo: null, // TODO : champ absent en base
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

export default function CandidatProfilPage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
    quartier: user?.quartier || '',
    sexe: DONNEES_PROVISOIRES.sexe,
    ville: DONNEES_PROVISOIRES.ville,
    anneesExperience: DONNEES_PROVISOIRES.anneesExperience,
    niveauEtude: DONNEES_PROVISOIRES.niveauEtude,
    domaineEtudes: DONNEES_PROVISOIRES.domaineEtudes,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Vous devez être connecté pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  const initiale = user.prenom?.charAt(0).toUpperCase() || 'C';

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!formData.telephone.trim()) newErrors.telephone = 'Le téléphone est requis';
    if (!formData.quartier.trim()) newErrors.quartier = 'Le quartier est requis';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    // TODO : Appel API pour sauvegarder les modifications
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      nom: user?.nom || '',
      prenom: user?.prenom || '',
      email: user?.email || '',
      telephone: user?.telephone || '',
      quartier: user?.quartier || '',
      sexe: DONNEES_PROVISOIRES.sexe,
      ville: DONNEES_PROVISOIRES.ville,
      anneesExperience: DONNEES_PROVISOIRES.anneesExperience,
      niveauEtude: DONNEES_PROVISOIRES.niveauEtude,
      domaineEtudes: DONNEES_PROVISOIRES.domaineEtudes,
    });
    setErrors({});
    setIsEditing(false);
  };

  const inputClass =
    'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent';
  const inputClassError =
    'w-full rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent';
  const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Lien retour */}
        <Link
          href="/profil"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Retour à l'aperçu
        </Link>

        {/* En-tête profil */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white"
              style={{ backgroundColor: COLORS.midnight }}
            >
              {DONNEES_PROVISOIRES.photo ? (
                <img
                  src={DONNEES_PROVISOIRES.photo}
                  alt={`${user.prenom} ${user.nom}`}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                initiale
              )}
            </div>

            {/* Informations */}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: COLORS.midnight }}>
                {user.prenom} {user.nom}
              </h1>
              <p className="text-gray-600 mb-4">{user.email}</p>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: isEditing ? '#E5E7EB' : COLORS.midnight, color: isEditing ? '#374151' : 'white' }}
              >
                {isEditing ? (
                  <>
                    <X size={18} />
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

        {isEditing ? (
          <div className="space-y-6">
            {/* Formulaire d'édition */}
            <SectionCard icon={User} title="Informations personnelles">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="nom" className={labelClass}>
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="nom"
                      type="text"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      className={errors.nom ? inputClassError : inputClass}
                    />
                    {errors.nom && <p className="mt-1 text-xs text-red-600">{errors.nom}</p>}
                  </div>
                  <div>
                    <label htmlFor="prenom" className={labelClass}>
                      Prénoms <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="prenom"
                      type="text"
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      className={errors.prenom ? inputClassError : inputClass}
                    />
                    {errors.prenom && <p className="mt-1 text-xs text-red-600">{errors.prenom}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className={labelClass}>
                    E-mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
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
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className={errors.telephone ? inputClassError : inputClass}
                    />
                    {errors.telephone && <p className="mt-1 text-xs text-red-600">{errors.telephone}</p>}
                  </div>
                  <div>
                    <label htmlFor="quartier" className={labelClass}>
                      Quartier <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="quartier"
                      type="text"
                      value={formData.quartier}
                      onChange={(e) => setFormData({ ...formData, quartier: e.target.value })}
                      className={errors.quartier ? inputClassError : inputClass}
                    />
                    {errors.quartier && <p className="mt-1 text-xs text-red-600">{errors.quartier}</p>}
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
                        checked={formData.sexe === 'Masculin'}
                        onChange={(e) => setFormData({ ...formData, sexe: e.target.value })}
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
                        checked={formData.sexe === 'Féminin'}
                        onChange={(e) => setFormData({ ...formData, sexe: e.target.value })}
                        style={{ accentColor: COLORS.midnight }}
                        className="h-4 w-4"
                      />
                      Féminin
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">TODO : champ absent en base</p>
                </div>

                <div>
                  <label htmlFor="ville" className={labelClass}>
                    Ville de résidence <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="ville"
                    type="text"
                    value={formData.ville}
                    onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                    className={inputClass}
                  />
                  <p className="mt-1 text-xs text-gray-400">TODO : champ absent en base (il y a "quartier" mais pas "ville")</p>
                </div>
              </div>
            </SectionCard>

            <SectionCard icon={Briefcase} title="Parcours">
              <div className="space-y-4">
                <div>
                  <label htmlFor="anneesExperience" className={labelClass}>
                    Années d'expérience <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="anneesExperience"
                    type="number"
                    min={0}
                    value={formData.anneesExperience}
                    onChange={(e) => setFormData({ ...formData, anneesExperience: parseInt(e.target.value) || 0 })}
                    className={inputClass}
                  />
                  <p className="mt-1 text-xs text-gray-400">TODO : champ absent en base</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="niveauEtude" className={labelClass}>
                      Niveau d'étude <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="niveauEtude"
                      type="text"
                      value={formData.niveauEtude}
                      onChange={(e) => setFormData({ ...formData, niveauEtude: e.target.value })}
                      className={inputClass}
                    />
                    <p className="mt-1 text-xs text-gray-400">TODO : champ absent en base</p>
                  </div>
                  <div>
                    <label htmlFor="domaineEtudes" className={labelClass}>
                      Domaine d'études <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="domaineEtudes"
                      type="text"
                      value={formData.domaineEtudes}
                      onChange={(e) => setFormData({ ...formData, domaineEtudes: e.target.value })}
                      className={inputClass}
                    />
                    <p className="mt-1 text-xs text-gray-400">TODO : champ absent en base</p>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Boutons d'action */}
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="flex-1 rounded-lg px-4 py-3 font-bold text-gray-900 shadow-sm transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                style={{ backgroundColor: COLORS.yellow }}
              >
                <Check size={18} />
                Enregistrer
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Affichage en lecture seule */}
            <SectionCard icon={User} title="Informations personnelles">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Nom</p>
                    <p className="font-semibold text-gray-900">{user.nom}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Prénoms</p>
                    <p className="font-semibold text-gray-900">{user.prenom}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">E-mail</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" />
                    {user.email}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Téléphone</p>
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      <Phone size={16} className="text-gray-400" />
                      {user.telephone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Quartier</p>
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      {user.quartier}
                    </p>
                  </div>
                </div>

                {/* Champs manquants en base */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Sexe</p>
                  <p className="font-semibold text-gray-900">{DONNEES_PROVISOIRES.sexe}</p>
                  <p className="mt-1 text-xs text-gray-400">TODO : champ absent en base</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Ville de résidence</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    {DONNEES_PROVISOIRES.ville}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">TODO : champ absent en base (il y a "quartier" mais pas "ville")</p>
                </div>
              </div>
            </SectionCard>

            <SectionCard icon={Briefcase} title="Parcours">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Années d'expérience</p>
                  <p className="font-semibold text-gray-900">{DONNEES_PROVISOIRES.anneesExperience} ans</p>
                  <p className="mt-1 text-xs text-gray-400">TODO : champ absent en base</p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Niveau d'étude</p>
                    <p className="font-semibold text-gray-900">{DONNEES_PROVISOIRES.niveauEtude}</p>
                    <p className="mt-1 text-xs text-gray-400">TODO : champ absent en base</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Domaine d'études</p>
                    <p className="font-semibold text-gray-900">{DONNEES_PROVISOIRES.domaineEtudes}</p>
                    <p className="mt-1 text-xs text-gray-400">TODO : champ absent en base</p>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard icon={FileText} title="Mes documents">
              <div className="flex items-center justify-between rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{DONNEES_PROVISOIRES.cvFile}</p>
                    <p className="text-xs text-gray-500">PDF · 2.4 MB</p>
                  </div>
                </div>
                <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <Download size={16} />
                  Télécharger
                </button>
              </div>
              <p className="mt-3 text-xs text-gray-400">TODO : champ absent en base (fichier.cv)</p>
            </SectionCard>

            <SectionCard icon={Calendar} title="Mon activité">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Link
                  href="/profil"
                  className="flex items-center gap-4 rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50"
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: '#F3F4F6', color: COLORS.midnight }}
                  >
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{DONNEES_PROVISOIRES.candidaturesCount}</p>
                    <p className="text-sm text-gray-600">Candidatures déposées</p>
                  </div>
                </Link>
                <Link
                  href="/profil"
                  className="flex items-center gap-4 rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50"
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: '#F3F4F6', color: COLORS.midnight }}
                  >
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{DONNEES_PROVISOIRES.entretiensCount}</p>
                    <p className="text-sm text-gray-600">Entretiens programmés</p>
                  </div>
                </Link>
              </div>
            </SectionCard>
          </div>
        )}
      </main>
    </div>
  );
}
