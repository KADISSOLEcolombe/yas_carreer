'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

const COLORS = {
  midnight: '#1e3a8a',
  yellow: '#facc15',
};

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: number;
  jobTitle: string;
  userId: string;
  userNom: string;
  userEmail: string;
}

const NIVEAUX_ETUDE = ['Bac', 'Bac+2', 'Bac+3', 'Bac+5', 'Doctorat'];
const DOMAINES_ETUDE = ['Informatique', 'Gestion', 'Marketing', 'Finance', 'Ressources Humaines', 'Autre'];

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // L'envoi réel de la candidature sera branché plus tard.
  };

  const inputClass =
    'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent';
  const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-gray-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-bold" style={{ color: COLORS.midnight }}>
              Postuler à cette offre
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">{jobTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Nom / Prénoms */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className={labelClass}>
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                Prénoms <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={prenoms}
                onChange={(e) => setPrenoms(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* E-mail / Téléphone */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className={labelClass}>
                E-mail <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-gray-400">
                Les notifications vous seront envoyées sur ce mail. Assurez-vous, svp, qu&apos;il soit fonctionnel.
              </p>
            </div>
            <div>
              <label className={labelClass}>
                Numéro de téléphone <span className="text-red-500">*</span>
              </label>
              <div className="flex items-stretch overflow-hidden rounded-xl border border-gray-200 bg-gray-50 focus-within:ring-2 focus-within:ring-yellow-400">
                <div className="flex items-center gap-1 border-r border-gray-200 bg-gray-100 px-3 text-sm text-gray-700">
                  <span>🇹🇬</span>
                  <span>+228</span>
                  <ChevronDown size={14} />
                </div>
                <input
                  type="tel"
                  required
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="90 11 23 45"
                  className="flex-1 bg-transparent px-3 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Sexe */}
          <div>
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
          </div>

          {/* CV / Lettre de motivation */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className={labelClass}>
                CV et Portfolio <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <label
                  className="cursor-pointer whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: COLORS.midnight }}
                >
                  Choisir un fichier
                  <input
                    type="file"
                    required
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                <span className="truncate text-sm text-gray-500">{cvFile ? cvFile.name : 'Aucun fichier choisi'}</span>
              </div>
              <p className="mt-1.5 text-xs text-gray-400">La taille du fichier ne doit pas dépasser 5MB</p>
            </div>
            <div>
              <label className={labelClass}>Lettre de Motivation</label>
              <div className="flex items-center gap-3">
                <label
                  className="cursor-pointer whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: COLORS.midnight }}
                >
                  Choisir un fichier
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setLettreFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                <span className="truncate text-sm text-gray-500">
                  {lettreFile ? lettreFile.name : 'Aucun fichier choisi'}
                </span>
              </div>
            </div>
          </div>

          {/* Expérience / Niveau d'étude / Domaine d'études */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div>
              <label className={labelClass}>
                Années d&apos;expérience <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                required
                value={anneesExperience}
                onChange={(e) => setAnneesExperience(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                Niveau d&apos;étude <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={niveauEtude}
                  onChange={(e) => setNiveauEtude(e.target.value)}
                  className={`${inputClass} appearance-none pr-9`}
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
            </div>
            <div>
              <label className={labelClass}>
                Domaine d&apos;études <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={domaineEtudes}
                  onChange={(e) => setDomaineEtudes(e.target.value)}
                  className={`${inputClass} appearance-none pr-9`}
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
            </div>
          </div>

          {/* Ville de résidence */}
          <div>
            <label className={labelClass}>
              Ville de résidence <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={villeResidence}
              onChange={(e) => setVilleResidence(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex gap-3 border-t border-gray-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg px-4 py-3 font-bold text-gray-900 shadow-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: COLORS.yellow }}
            >
              Envoyer ma candidature
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
