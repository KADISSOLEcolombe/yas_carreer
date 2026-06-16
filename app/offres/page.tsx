'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getJobs, resetJobsToDefaults, type Job } from '../../lib/jobs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, MapPin, Filter, Briefcase, ChevronRight, ArrowLeft, Users, LogOut, Building, Award } from 'lucide-react';

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

export default function OffersPage() {
  const { isAuthenticated, isRecruiter } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Tous');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadJobs = () => {
    try {
      const loadedJobs = getJobs();
      console.log('Offres chargées:', loadedJobs.length, loadedJobs);
      setJobs(loadedJobs);
      setLoaded(true);
    } catch (error) {
      console.error('Erreur lors du chargement des offres:', error);
      setJobs([]);
      setLoaded(true);
    }
  };

  useEffect(() => {
    loadJobs();

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'yas_jobs' || e.key === null) loadJobs();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', loadJobs);
    window.addEventListener('yas-jobs-updated', loadJobs);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', loadJobs);
      window.removeEventListener('yas-jobs-updated', loadJobs);
    };
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'Tous' || job.type === filterType;
    return matchesSearch && matchesType;
  });

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

  const handleApply = (jobId: number) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/offres/${jobId}&message=auth_required`);
    } else if (isRecruiter) {
      router.push('/rh/dashboard');
    } else {
      router.push(`/offres/${jobId}`);
    }
  };

  const handleReset = () => {
    if (confirm('Réinitialiser toutes les offres aux valeurs par défaut ?')) {
      resetJobsToDefaults();
      loadJobs();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
              <ArrowLeft size={16} />
              Retour à l'accueil
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.text.primary }}>
                  Offres d'emploi et stages
                </h1>
                <p style={{ color: COLORS.text.secondary }}>
                  {filteredJobs.length} offre{filteredJobs.length > 1 ? 's' : ''} trouvée{filteredJobs.length > 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={handleReset}
                className="text-xs px-3 py-1.5 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
                title="Réinitialiser les offres aux valeurs par défaut"
              >
                🔄 Réinitialiser
              </button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-8 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-md bg-white">
                <Search size={18} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un poste, une compétence ou une entreprise"
                  className="flex-1 outline-none text-gray-900"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-md bg-white">
                <Filter size={18} className="text-gray-400" />
                <select 
                  className="outline-none text-gray-900 bg-transparent"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="Tous">Tous les types</option>
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="Stage">Stage</option>
                </select>
              </div>
            </div>
          </div>

          {/* Jobs Grid */}
          {!loaded ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: COLORS.midnight }} />
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => {
                const typeColor = getTypeColor(job.type);
                return (
                  <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                    <div className="mb-4">
                      <h3 className="font-semibold text-lg mb-1 text-gray-900">{job.title}</h3>
                      <p className="text-gray-600 text-sm">{job.company}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mb-4">
                      <span className="flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPin size={16} /> {job.location}
                      </span>
                      {job.salary && (
                        <span className="text-sm text-gray-500">{job.salary}</span>
                      )}
                      <span
                        className="px-2.5 py-1 rounded text-xs font-semibold"
                        style={{ backgroundColor: typeColor.bg, color: typeColor.text }}
                      >
                        {job.type}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-5 line-clamp-2">
                      {job.description}
                    </p>
                    
                    <div className="flex gap-3 pt-5 border-t border-gray-100">
                      <Link
                        href={`/offres/${job.id}`}
                        className="flex-1 text-center py-2.5 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                      >
                        Voir détails
                      </Link>
                      <button
                        onClick={() => handleApply(job.id)}
                        className="flex-1 py-2.5 rounded-md font-bold text-gray-900 text-sm transition-all hover:opacity-90 shadow-sm"
                        style={{ backgroundColor: COLORS.yellow }}
                      >
                        Postuler
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
              <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune offre trouvée</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Essayez de modifier vos critères de recherche pour trouver des opportunités correspondantes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
