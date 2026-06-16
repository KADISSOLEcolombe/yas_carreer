'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Briefcase, ArrowLeft, Users, LogOut } from 'lucide-react';
import ApplicationModal from '../../../components/ApplicationModal';
import { getJobById, type Job } from '../../../lib/jobs';

const COLORS = {
  yellow: '#FFD100',
  midnight: '#00377D',
  sky: '#5F99D2',
  text: {
    primary: '#1A1A1A',
    secondary: '#4B5563',
    muted: '#9CA3AF',
  },
  border: '#E5E7EB',
};

// Header Component
function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-md flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: COLORS.yellow }}
            >
              YT
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight" style={{ color: COLORS.midnight }}>
                YAS Togo
              </span>
              <span className="text-xs leading-tight" style={{ color: COLORS.text.muted }}>
                Nos offres d'emploi
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/offres" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Nos offres
            </Link>
            <Link href="/a-propos" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              À propos
            </Link>
          </nav>

          {/* Buttons */}
          <div className="hidden sm:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/profil"
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 font-medium transition-colors"
                >
                  <Users size={18} />
                  Mon espace
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 font-medium transition-colors"
                >
                  Se connecter
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2 text-gray-900 rounded-md font-medium transition-all hover:opacity-90"
                  style={{ backgroundColor: COLORS.yellow }}
                >
                  Créer un compte
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-gray-200 space-y-2">
            <Link href="/offres" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">
              Nos offres
            </Link>
            <Link href="/a-propos" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">
              À propos
            </Link>
            <div className="pt-2 mt-2 border-t border-gray-200">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/profil"
                    className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md mb-2"
                  >
                    Mon espace
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md mb-2"
                  >
                    Se connecter
                  </Link>
                  <Link
                    href="/register"
                    className="block px-3 py-2 text-gray-900 rounded-md text-center font-medium"
                    style={{ backgroundColor: COLORS.yellow }}
                  >
                    Créer un compte
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

export default function JobDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [job, setJob] = useState<Job | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setJob(getJobById(Number(id)));
    setLoaded(true);
  }, [id]);

  if (!loaded) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2" style={{ borderColor: COLORS.midnight }} />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Offre non trouvée</h2>
          <p className="text-gray-600 mb-6">L'offre que vous recherchez n'existe pas ou n'est plus disponible.</p>
          <Link href="/offres" className="inline-flex items-center gap-2 px-6 py-3 text-gray-900 font-bold rounded-md transition-all hover:opacity-90 shadow-sm" style={{ backgroundColor: COLORS.yellow }}>
            <ArrowLeft size={18} />
            Retour aux offres
          </Link>
        </div>
      </div>
    );
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Stage':
        return { bg: '#FFF7D6', text: '#854D0E' };
      case 'CDI':
        return { bg: '#D1FAE5', text: '#065F46' };
      case 'CDD':
        return { bg: '#DBEAFE', text: '#1E40AF' };
      default:
        return { bg: '#F3F4F6', text: '#4B5563' };
    }
  };

  const typeColor = getTypeColor(job.type);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/offres" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors">
            <ArrowLeft size={16} />
            Retour aux offres
          </Link>

          {/* Job Header */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 mb-8">
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.text.primary }}>
                  {job.title}
                </h1>
                <p className="text-xl text-gray-600 mb-4">{job.company}</p>
                
                <div className="flex flex-wrap gap-4 mb-6">
                  <span className="flex items-center gap-2 text-gray-600">
                    <MapPin size={18} />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-2 text-gray-600">
                    <Briefcase size={18} />
                    {job.salary}
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-sm font-semibold"
                    style={{ backgroundColor: typeColor.bg, color: typeColor.text }}
                  >
                    {job.type}
                  </span>
                </div>
              </div>
              
              {!isAuthenticated ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.midnight }}>
                    Connexion requise
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">
                    Vous devez créer un compte ou vous connecter avant de pouvoir postuler à cette offre.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      href={`/register?redirect=/offres/${id}&message=auth_required`}
                      className="px-6 py-3 text-center rounded-md font-bold text-gray-900 transition-all hover:opacity-90 shadow-sm"
                      style={{ backgroundColor: COLORS.yellow }}
                    >
                      Créer un compte
                    </Link>
                    <Link
                      href={`/login?redirect=/offres/${id}&message=auth_required`}
                      className="px-6 py-3 text-center rounded-md font-bold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Se connecter
                    </Link>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsApplicationModalOpen(true)}
                  className="px-8 py-3 rounded-md font-bold text-gray-900 transition-all hover:opacity-90 shadow-sm w-fit"
                  style={{ backgroundColor: COLORS.yellow }}
                >
                  Postuler à cette offre
                </button>
              )}
            </div>
          </div>

          {/* Job Content */}
          <div className="space-y-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4" style={{ color: COLORS.text.primary }}>
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {job.description}
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4" style={{ color: COLORS.midnight }}>
                Responsabilités
              </h2>
              <ul className="space-y-3">
                {job.responsibilities.map((resp, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: COLORS.yellow }}></span>
                    <span className="text-gray-700">{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4" style={{ color: COLORS.midnight }}>
                Prérequis
              </h2>
              <ul className="space-y-3">
                {job.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: COLORS.yellow }}></span>
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {user && (
        <ApplicationModal
          isOpen={isApplicationModalOpen}
          onClose={() => setIsApplicationModalOpen(false)}
          jobId={job.id}
          jobTitle={job.title}
          userId={user.id}
          userNom={user.nom}
          userEmail={user.email}
        />
      )}
    </div>
  );
}
