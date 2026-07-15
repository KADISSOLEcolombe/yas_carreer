'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, X, User, Briefcase, FileText, Link2, Upload, XCircle } from 'lucide-react';

const COLORS = {
  midnight: '#1e3a8a',
  yellow: '#facc15',
};

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: number | string;
  jobTitle: string;
  userId: string;
  userNom: string;
  userEmail: string;
}

const NIVEAUX_ETUDE = ['Bac', 'Bac+2', 'Bac+3', 'Bac+5', 'Doctorat'];
const DOMAINES_ETUDE = ['Informatique', 'Gestion', 'Marketing', 'Finance', 'Ressources Humaines', 'Autre'];

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

export default function ApplicationModal({
  isOpen,
  onClose,
  jobTitle,
  userEmail,
}: ApplicationModalProps) {
  const [nom, setNom] = useState('');
  const [prenoms, setPrenoms] = useState('');
  const [email, setEmail] = useState(userEmail);
  const [telephone, setTelephone] = useState('');
  const [sexe, setSexe] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [lettreFile, setLettreFile] = useState<File | null>(null);
  const [anneesExperience, setAnneesExperience] = useState('');
  const [niveauEtude, setNiveauEtude] = useState('');
  const [domaineEtudes, setDomaineEtudes] = useState('');
  const [villeResidence, setVilleResidence] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail(userEmail);
    }
  }, [isOpen, userEmail]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!prenoms.trim()) newErrors.prenoms = 'Les prénoms sont requis';
    if (!email.trim()) newErrors.email = 'L\'e-mail est requis';
    if (!telephone.trim()) newErrors.telephone = 'Le téléphone est requis';
    if (!sexe) newErrors.sexe = 'Le sexe est requis';
    if (!villeResidence.trim()) newErrors.villeResidence = 'La ville de résidence est requise';
    if (!anneesExperience.trim()) newErrors.anneesExperience = 'Les années d\'expérience sont requises';
    if (!niveauEtude) newErrors.niveauEtude = 'Le niveau d\'étude est requis';
    if (!domaineEtudes) newErrors.domaineEtudes = 'Le domaine d\'études est requis';
    if (!cvFile) newErrors.cvFile = 'Le CV est requis';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (file: File | null) => void,
    fieldName: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation format
    const validFormats = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validFormats.includes(file.type)) {
      setErrors((prev) => ({ ...prev, [fieldName]: 'Format non accepté. PDF ou DOCX uniquement.' }));
      return;
    }

    // Validation taille (5 Mo)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, [fieldName]: 'Le fichier ne doit pas dépasser 5 Mo.' }));
      return;
    }

    setter(file);
    setErrors((prev) => ({ ...prev, [fieldName]: '' }));
  };

  const handleRemoveFile = (setter: (file: File | null) => void, fieldName: string) => {
    setter(null);
    setErrors((prev) => ({ ...prev, [fieldName]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll vers le premier champ en erreur
      const firstErrorField = document.querySelector('[data-error="true"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    // L'envoi réel de la candidature sera branché plus tard
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 2000);
  };

  const inputClass =
    'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent';
  const inputClassError =
    'w-full rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent';
  const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* En-tête */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-gray-200 bg-white px-6 py-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: COLORS.midnight }}>
              Candidature au poste
            </h1>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold" style={{ backgroundColor: '#DBEAFE', color: COLORS.midnight }}>
              <Briefcase size={14} />
              {jobTitle}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* SECTION 1 — Informations personnelles */}
          <SectionCard icon={User} title="Informations personnelles">
            <div className="space-y-5">
              {/* Nom / Prénoms */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div data-error={!!errors.nom}>
                  <label htmlFor="nom" className={labelClass}>
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="nom"
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className={errors.nom ? inputClassError : inputClass}
                  />
                  {errors.nom && <p className="mt-1 text-xs text-red-600">{errors.nom}</p>}
                </div>
                <div data-error={!!errors.prenoms}>
                  <label htmlFor="prenoms" className={labelClass}>
                    Prénoms <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="prenoms"
                    type="text"
                    required
                    value={prenoms}
                    onChange={(e) => setPrenoms(e.target.value)}
                    className={errors.prenoms ? inputClassError : inputClass}
                  />
                  {errors.prenoms && <p className="mt-1 text-xs text-red-600">{errors.prenoms}</p>}
                </div>
              </div>

              {/* E-mail / Téléphone */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div data-error={!!errors.email}>
                  <label htmlFor="email" className={labelClass}>
                    E-mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={errors.email ? inputClassError : inputClass}
                  />
                  <p className="mt-1.5 text-xs text-gray-400">
                    Les notifications vous seront envoyées sur ce mail. Assurez-vous qu'il soit fonctionnel.
                  </p>
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>
                <div data-error={!!errors.telephone}>
                  <label htmlFor="telephone" className={labelClass}>
                    Numéro de téléphone <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-stretch overflow-hidden rounded-xl border border-gray-200 bg-gray-50 focus-within:ring-2 focus-within:ring-yellow-400">
                    <div className="flex items-center gap-1 border-r border-gray-200 bg-gray-100 px-3 text-sm text-gray-700">
                      <span>+228</span>
                    </div>
                    <input
                      id="telephone"
                      type="tel"
                      required
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      placeholder="90 11 23 45"
                      className="flex-1 bg-transparent px-3 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                    />
                  </div>
                  {errors.telephone && <p className="mt-1 text-xs text-red-600">{errors.telephone}</p>}
                </div>
              </div>

              {/* Sexe */}
              <div data-error={!!errors.sexe}>
                <label className={labelClass}>
                  Sexe <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-8">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="sexe"
                      value="Masculin"
                      checked={sexe === 'Masculin'}
                      onChange={(e) => setSexe(e.target.value)}
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
                      checked={sexe === 'Féminin'}
                      onChange={(e) => setSexe(e.target.value)}
                      style={{ accentColor: COLORS.midnight }}
                      className="h-4 w-4"
                    />
                    Féminin
                  </label>
                </div>
                {errors.sexe && <p className="mt-1 text-xs text-red-600">{errors.sexe}</p>}
              </div>

              {/* Ville de résidence */}
              <div data-error={!!errors.villeResidence}>
                <label htmlFor="villeResidence" className={labelClass}>
                  Ville de résidence <span className="text-red-500">*</span>
                </label>
                <input
                  id="villeResidence"
                  type="text"
                  required
                  value={villeResidence}
                  onChange={(e) => setVilleResidence(e.target.value)}
                  className={errors.villeResidence ? inputClassError : inputClass}
                />
                {errors.villeResidence && <p className="mt-1 text-xs text-red-600">{errors.villeResidence}</p>}
              </div>
            </div>
          </SectionCard>

          {/* SECTION 2 — Parcours */}
          <SectionCard icon={Briefcase} title="Parcours">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div data-error={!!errors.anneesExperience}>
                <label htmlFor="anneesExperience" className={labelClass}>
                  Années d'expérience <span className="text-red-500">*</span>
                </label>
                <input
                  id="anneesExperience"
                  type="number"
                  min={0}
                  required
                  value={anneesExperience}
                  onChange={(e) => setAnneesExperience(e.target.value)}
                  className={errors.anneesExperience ? inputClassError : inputClass}
                />
                {errors.anneesExperience && <p className="mt-1 text-xs text-red-600">{errors.anneesExperience}</p>}
              </div>
              <div data-error={!!errors.niveauEtude}>
                <label htmlFor="niveauEtude" className={labelClass}>
                  Niveau d'étude <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="niveauEtude"
                    required
                    value={niveauEtude}
                    onChange={(e) => setNiveauEtude(e.target.value)}
                    className={`${errors.niveauEtude ? inputClassError : inputClass} appearance-none pr-9`}
                  >
                    <option value="" disabled>
                      Sélectionner une option
                    </option>
                    {NIVEAUX_ETUDE.map((niveau) => (
                      <option key={niveau} value={niveau}>
                        {niveau}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                {errors.niveauEtude && <p className="mt-1 text-xs text-red-600">{errors.niveauEtude}</p>}
              </div>
              <div data-error={!!errors.domaineEtudes}>
                <label htmlFor="domaineEtudes" className={labelClass}>
                  Domaine d'études <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="domaineEtudes"
                    required
                    value={domaineEtudes}
                    onChange={(e) => setDomaineEtudes(e.target.value)}
                    className={`${errors.domaineEtudes ? inputClassError : inputClass} appearance-none pr-9`}
                  >
                    <option value="" disabled>
                      Sélectionner une option
                    </option>
                    {DOMAINES_ETUDE.map((domaine) => (
                      <option key={domaine} value={domaine}>
                        {domaine}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                {errors.domaineEtudes && <p className="mt-1 text-xs text-red-600">{errors.domaineEtudes}</p>}
              </div>
            </div>
          </SectionCard>

          {/* SECTION 3 — Documents de candidature */}
          <SectionCard icon={FileText} title="Documents de candidature">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* CV */}
              <div data-error={!!errors.cvFile}>
                <label htmlFor="cvFile" className={labelClass}>
                  Curriculum Vitae (CV) <span className="text-red-500">*</span>
                </label>
                {cvFile ? (
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-gray-500" />
                      <span className="truncate text-sm text-gray-700">{cvFile.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(setCvFile, 'cvFile')}
                      className="p-1 text-gray-400 hover:text-red-500"
                      aria-label="Retirer le CV"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="cvFile"
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 cursor-pointer transition-colors hover:border-gray-400 hover:bg-gray-100"
                  >
                    <Upload size={32} className="text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Cliquez ou glissez votre fichier ici</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, DOCX (Max 5 Mo)</p>
                    <input
                      id="cvFile"
                      type="file"
                      required
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange(e, setCvFile, 'cvFile')}
                      className="hidden"
                    />
                  </label>
                )}
                {errors.cvFile && <p className="mt-1 text-xs text-red-600">{errors.cvFile}</p>}
              </div>

              {/* Lettre de motivation */}
              <div>
                <label htmlFor="lettreFile" className={labelClass}>
                  Lettre de motivation
                </label>
                {lettreFile ? (
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-gray-500" />
                      <span className="truncate text-sm text-gray-700">{lettreFile.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(setLettreFile, 'lettreFile')}
                      className="p-1 text-gray-400 hover:text-red-500"
                      aria-label="Retirer la lettre de motivation"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="lettreFile"
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 cursor-pointer transition-colors hover:border-gray-400 hover:bg-gray-100"
                  >
                    <Upload size={32} className="text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Cliquez ou glissez votre fichier ici</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, DOCX (Max 5 Mo)</p>
                    <input
                      id="lettreFile"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange(e, setLettreFile, 'lettreFile')}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </SectionCard>

          {/* SECTION 4 — Présence en ligne */}
          <SectionCard icon={Link2} title="Présence en ligne">
            <div className="space-y-5">
              <p className="text-sm text-gray-500">
                Ces informations sont optionnelles mais recommandées.
              </p>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="linkedin" className={labelClass}>
                    Profil LinkedIn
                  </label>
                  <input
                    id="linkedin"
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="portfolio" className={labelClass}>
                    Portfolio / GitHub
                  </label>
                  <input
                    id="portfolio"
                    type="url"
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                    placeholder="https://github.com/username"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Bas de page */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-gray-200 pt-6">
            <p className="text-xs text-gray-500 max-w-lg">
              En cliquant sur « Envoyer ma candidature », vous acceptez que YAS Togo traite vos données personnelles pour ce processus de recrutement.
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl px-6 py-3 font-bold text-gray-900 shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{ backgroundColor: COLORS.yellow }}
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
                  Envoi en cours...
                </>
              ) : (
                'Envoyer ma candidature'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
