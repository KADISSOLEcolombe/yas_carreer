'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, CheckCircle } from 'lucide-react';
import { hasApplied, saveApplication } from '../lib/applications';
import { sendNotification } from '../lib/notifications';

const COLORS = {
  yellow: '#FFD100',
  midnight: '#00377D',
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

export default function ApplicationModal({
  isOpen,
  onClose,
  jobId,
  jobTitle,
  userId,
  userNom,
  userEmail,
}: ApplicationModalProps) {
  const [nom, setNom] = useState(userNom);
  const [email, setEmail] = useState(userEmail);
  const [telephone, setTelephone] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNom(userNom);
      setEmail(userEmail);
      setTelephone('');
      setCoverLetter('');
      setCvFile(null);
      setError('');
      setIsSuccess(false);
      setAlreadyApplied(hasApplied(userId, jobId));
    }
  }, [isOpen, userNom, userEmail, userId, jobId]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.type)) {
      setError('Format non accepté. Veuillez envoyer un fichier PDF ou Word.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Le fichier ne doit pas dépasser 5 Mo.');
      return;
    }
    setError('');
    setCvFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!telephone.trim()) {
      setError('Veuillez renseigner votre numéro de téléphone.');
      return;
    }
    if (!cvFile) {
      setError('Veuillez joindre votre CV.');
      return;
    }
    if (!coverLetter.trim()) {
      setError('Veuillez rédiger une lettre de motivation.');
      return;
    }

    setIsSubmitting(true);
    try {
      saveApplication({
        userId,
        jobId,
        jobTitle,
        nom: nom.trim(),
        email: email.trim(),
        telephone: telephone.trim(),
        coverLetter: coverLetter.trim(),
        cvFileName: cvFile.name,
      });
      sendNotification({
        userId: 'rh-1',
        title: 'Nouvelle candidature',
        message: `${nom.trim()} a postulé pour « ${jobTitle} ».`,
        type: 'APPLICATION',
      });
      setIsSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <div>
            <h2 className="text-lg font-bold" style={{ color: COLORS.midnight }}>
              Postuler à cette offre
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">{jobTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {alreadyApplied ? (
            <div className="text-center py-8">
              <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.midnight }}>
                Candidature déjà envoyée
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Vous avez déjà postulé à cette offre. Consultez le suivi dans votre espace candidat.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-md font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
            </div>
          ) : isSuccess ? (
            <div className="text-center py-8">
              <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.midnight }}>
                Candidature envoyée !
              </h3>
              <p className="text-gray-600 text-sm">
                Votre candidature a bien été enregistrée. Vous pouvez suivre son évolution dans votre espace.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="+228 90 00 00 00"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  CV <span className="text-red-500">*</span>
                </label>
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
                  {cvFile ? (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <FileText size={20} style={{ color: COLORS.midnight }} />
                      <span className="font-medium">{cvFile.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-gray-500">
                      <Upload size={24} className="mb-2" />
                      <span className="text-sm">Cliquez pour joindre votre CV</span>
                      <span className="text-xs mt-1">PDF ou Word, max 5 Mo</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Lettre de motivation <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={5}
                  placeholder="Présentez-vous et expliquez pourquoi vous êtes le candidat idéal pour ce poste..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-md font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 rounded-md font-bold text-gray-900 transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: COLORS.yellow }}
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma candidature'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
