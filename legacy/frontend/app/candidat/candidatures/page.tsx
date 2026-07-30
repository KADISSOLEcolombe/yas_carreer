'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { api, mapCandidature, type Application } from '../../../lib/api';
import Link from 'next/link';
import { ArrowLeft, Briefcase, Calendar, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';

const COLORS = {
  midnight: '#00377D',
  yellow: '#FFD100',
  text: {
    primary: '#1A1A1A',
    secondary: '#4B5563',
  },
};

const STATUS_CONFIG = {
  PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  IN_REVIEW: { label: 'En examen', color: 'bg-blue-100 text-blue-800', icon: FileText },
  INTERVIEW: { label: 'Entretien', color: 'bg-purple-100 text-purple-800', icon: Briefcase },
  ACCEPTED: { label: 'Acceptée', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  REJECTED: { label: 'Refusée', color: 'bg-red-100 text-red-800', icon: XCircle },
};

export default function CandidatCandidaturesPage() {
  const { user, isAuthenticated } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadApplications = async () => {
      if (!isAuthenticated || !user) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const apiCandidatures = await api.getMyApplications();
        const mappedApplications = apiCandidatures.map(mapCandidature);
        setApplications(mappedApplications);
      } catch (err: any) {
        console.error('Erreur lors du chargement des candidatures:', err);
        setError(err.message || 'Impossible de charger vos candidatures');
      } finally {
        setIsLoading(false);
      }
    };

    loadApplications();
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connexion requise</h2>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 font-bold rounded-lg transition-all hover:opacity-90"
            style={{ backgroundColor: COLORS.yellow, color: COLORS.midnight }}
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
            <ArrowLeft size={16} />
            Retour à l'accueil
          </Link>
          <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.midnight }}>
            Mes Candidatures
          </h1>
          <p className="text-gray-600">
            Suivez l'état de vos candidatures aux offres d'emploi
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: COLORS.midnight }} />
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
            <FileText size={48} className="mx-auto text-red-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90"
              style={{ backgroundColor: COLORS.midnight }}
            >
              Réessayer
            </button>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
            <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune candidature</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Vous n'avez pas encore postulé à des offres d'emploi.
            </p>
            <Link
              href="/offres"
              className="inline-flex items-center gap-2 px-6 py-3 font-bold rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: COLORS.yellow, color: COLORS.midnight }}
            >
              Voir les offres disponibles
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => {
              const config = STATUS_CONFIG[application.status];
              const StatusIcon = config.icon;
              
              return (
                <div
                  key={application.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${COLORS.yellow}33` }}
                        >
                          <Briefcase size={24} style={{ color: COLORS.midnight }} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {application.jobTitle}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            Candidée le {new Date(application.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
                            >
                              <StatusIcon size={14} />
                              {config.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/candidat/candidatures/${application.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Voir détails
                      <ArrowLeft size={16} className="rotate-180" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
