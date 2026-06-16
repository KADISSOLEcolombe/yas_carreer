'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getJobs, resetJobsToDefaults, type Job } from '../lib/jobs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, MapPin, ChevronRight, Search, Building, Users, Award, LogOut } from 'lucide-react';

// Type definitions
interface JobOffer {
  id: number;
  title: string;
  company: string;
  location: string;
  type: 'Stage' | 'CDI' | 'CDD';
  salary?: string;
}

// Color palette (adjusted for professionalism and brand identity)
const COLORS = {
  yellow: '#FFD100',        // Sunshine Yellow (Dominant)
  midnight: '#00377D',      // Midnight Blue
  sky: '#5F99D2',           // Sky Blue (Headline/Limited use)
  text: {
    primary: '#1A1A1A',
    secondary: '#4B5563',
    muted: '#9CA3AF',
  },
  background: {
    main: '#FFFFFF',
    light: '#F9FAFB',
    gray: '#F3F4F6',
  },
  border: '#E5E7EB'
};

// Header Component (professional redesign)
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
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            {isMenuOpen ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/></svg>}
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

// Hero Section Component
function HeroSection() {
  const recentOffers: JobOffer[] = [
    { id: 1, title: 'Développeur Web Junior', company: 'YAS Togo', location: 'Lomé', type: 'CDI' },
    { id: 2, title: 'Stage Marketing Digital', company: 'YAS Togo', location: 'Lomé', type: 'Stage' },
    { id: 3, title: 'Comptable Stagiaire', company: 'YAS Togo', location: 'Kara', type: 'Stage' },
    { id: 4, title: 'Chargé de Communication', company: 'YAS Togo', location: 'Lomé', type: 'CDD' },
  ];

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

  return (
    <section className="pt-24 pb-16" style={{ backgroundColor: COLORS.midnight }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Left Content */}
          <div className="lg:col-span-2">
            <div className="mb-6 inline-block px-6 py-2 rounded-full" style={{ backgroundColor: COLORS.yellow }}>
              <span className="text-sm font-bold" style={{ color: COLORS.midnight }}>
                PLATEFORME OFFICIELLE YAS
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
              Trouve ton <span style={{ color: COLORS.yellow }}>stage</span> ou ton emploi au Togo !
            </h1>
            <p className="text-lg mb-8 leading-relaxed text-blue-100">
              YAS Togo recrute ! Découvrez toutes nos offres de stages, CDD et CDI et rejoignez l'équipe.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                href="/offres"
                className="px-8 py-4 text-gray-900 font-bold rounded-lg transition-all hover:opacity-90 shadow-md"
                style={{ backgroundColor: COLORS.yellow }}
              >
                Explorer les offres
              </Link>
              <Link
                href="/register"
                className="px-8 py-4 text-white font-bold rounded-lg transition-all hover:bg-blue-900 border-2 border-white"
                style={{ backgroundColor: 'transparent' }}
              >
                Créer mon profil
              </Link>
            </div>

            {/* Search bar */}
            <div className="bg-white border border-gray-200 rounded-lg p-3 mb-8 shadow-md">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-md">
                  <Search size={20} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Poste, compétences ou entreprise"
                    className="flex-1 outline-none text-gray-800"
                  />
                </div>
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-md">
                  <MapPin size={20} className="text-gray-400" />
                  <select className="outline-none text-gray-800 bg-transparent">
                    <option>Toute localisation</option>
                    <option>Lomé</option>
                    <option>Kara</option>
                    <option>Sokodé</option>
                  </select>
                </div>
                <button
                  className="px-8 py-3 text-gray-900 font-bold rounded-md transition-all hover:opacity-90"
                  style={{ backgroundColor: COLORS.yellow }}
                >
                  Rechercher
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8">
              <div>
                <div className="text-3xl font-bold mb-1" style={{ color: COLORS.yellow }}>
                  340+
                </div>
                <div className="text-sm text-blue-100">OFFRES ACTIVES</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1" style={{ color: COLORS.yellow }}>
                  120+
                </div>
                <div className="text-sm text-blue-100">ENTREPRISES</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1" style={{ color: COLORS.yellow }}>
                  2 800+
                </div>
                <div className="text-sm text-blue-100">CANDIDATS INSCRITS</div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Recent Offers */}
          <div className="hidden lg:block">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-900 font-bold" style={{ backgroundColor: COLORS.yellow }}>
                  YT
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Offres disponibles</h3>
                  <p className="text-xs text-gray-500">Récemment ajoutées</p>
                </div>
              </div>
              <div className="space-y-4">
                {recentOffers.map((offer) => {
                  const typeColor = getTypeColor(offer.type);
                  return (
                    <Link
                      key={offer.id}
                      href={`/offres/${offer.id}`}
                      className="block p-4 bg-gray-50 border border-transparent rounded-xl hover:border-gray-300 hover:shadow-md transition-all"
                    >
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm" style={{ color: COLORS.midnight }}>
                        {offer.title}
                      </h4>
                      <p className="text-xs text-gray-500 mb-2">{offer.company} · {offer.location}</p>
                      <div className="flex items-center justify-between">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: typeColor.bg, color: typeColor.text }}
                        >
                          {offer.type}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <Link
                href="/offres"
                className="w-full flex items-center justify-center gap-2 mt-6 px-4 py-3 rounded-md font-bold text-gray-400 bg-gray-100 hover:bg-gray-200 transition-all"
              >
                Voir toutes les offres <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Stats Section
function StatsSection() {
  const stats = [
    { number: '500+', label: 'Offres disponibles' },
    { number: '200+', label: 'Entreprises partenaires' },
    { number: '10k+', label: 'Candidats inscrits' },
  ];

  return (
    <section className="py-12" style={{ backgroundColor: COLORS.midnight }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index}>
              <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
              <div className="text-blue-200">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Why Choose YAS Section
function WhyChooseSection() {
  const benefits = [
    {
      icon: <Award size={28} />,
      title: 'Offres vérifiées',
      description: 'Toutes nos offres sont vérifiées par l\'équipe YAS Togo pour vous garantir des opportunités fiables et de qualité.',
    },
    {
      icon: <Building size={28} />,
      title: 'Rejoignez une équipe dynamique',
      description: 'Collaborez avec une équipe passionnée et contribuez à transformer le marché de l\'emploi au Togo.',
    },
    {
      icon: <Users size={28} />,
      title: 'Support dédié',
      description: 'Notre équipe est là pour vous accompagner tout au long de votre processus de candidature.',
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4" style={{ color: COLORS.midnight }}>
            Pourquoi choisir YAS Togo ?
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: COLORS.text.secondary }}>
            Une plateforme pensée pour les professionnels, avec des fonctionnalités adaptées aux réalités du marché togolais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="p-8 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all">
              <div className="w-12 h-12 rounded-md flex items-center justify-center mb-6" style={{ backgroundColor: COLORS.yellow, color: COLORS.midnight }}>
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: COLORS.midnight }}>
                {benefit.title}
              </h3>
              <p className="leading-relaxed" style={{ color: COLORS.text.secondary }}>
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Recent Offers Section
function RecentOffersSection() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [offers, setOffers] = useState<Job[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadOffers = () => {
    try {
      const loadedOffers = getJobs().slice(0, 6);
      console.log('Offres récentes chargées:', loadedOffers.length, loadedOffers);
      setOffers(loadedOffers);
      setLoaded(true);
    } catch (error) {
      console.error('Erreur lors du chargement des offres récentes:', error);
      setOffers([]);
      setLoaded(true);
    }
  };

  useEffect(() => {
    loadOffers();
    window.addEventListener('yas-jobs-updated', loadOffers);
    window.addEventListener('focus', loadOffers);
    return () => {
      window.removeEventListener('yas-jobs-updated', loadOffers);
      window.removeEventListener('focus', loadOffers);
    };
  }, []);

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
    } else {
      router.push(`/offres/${jobId}`);
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: COLORS.midnight }}>
              Offres à la une
            </h2>
            <p style={{ color: COLORS.text.secondary }}>
              Découvrez nos opportunités les plus récentes
            </p>
          </div>
          <Link
            href="/offres"
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Voir toutes les offres <ChevronRight size={16} />
          </Link>
        </div>

        {!loaded ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: COLORS.midnight }} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => {
            const typeColor = getTypeColor(offer.type);
            return (
              <div key={offer.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                <div className="mb-5">
                  <h3 className="font-semibold text-lg mb-2 text-gray-900">{offer.title}</h3>
                  <p className="text-gray-600 text-sm">{offer.company}</p>
                </div>
                
                <div className="flex flex-wrap gap-3 mb-5">
                  <span className="flex items-center gap-1.5 text-sm text-gray-600">
                    <MapPin size={16} /> {offer.location}
                  </span>
                  {offer.salary && (
                    <span className="text-sm text-gray-500">{offer.salary}</span>
                  )}
                  <span
                    className="px-2.5 py-1 rounded text-xs font-semibold"
                    style={{ backgroundColor: typeColor.bg, color: typeColor.text }}
                  >
                    {offer.type}
                  </span>
                </div>

                <div className="flex gap-3 pt-5 border-t border-gray-100">
                  <Link
                    href={`/offres/${offer.id}`}
                    className="flex-1 text-center py-2.5 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                  >
                    Voir détails
                  </Link>
                  <button
                    onClick={() => handleApply(offer.id)}
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
        )}

        <div className="mt-10 text-center sm:hidden">
          <Link
            href="/offres"
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Voir toutes les offres
          </Link>
        </div>
      </div>
    </section>
  );
}

// Footer Component
function Footer() {
  return (
    <footer style={{ backgroundColor: COLORS.midnight }} className="pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-md flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: COLORS.yellow }}>
                YT
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white">YAS Togo</span>
                <span className="text-xs text-gray-300">Nos offres d'emploi</span>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Trouvez votre prochaine opportunité professionnelle chez YAS Togo.
            </p>
          </div>

          {/* Candidats */}
          <div>
            <h4 className="font-semibold text-white mb-4">Candidats</h4>
            <ul className="space-y-2">
              <li><Link href="/offres" className="text-gray-400 hover:text-white text-sm transition-colors">Nos offres</Link></li>
              <li><Link href="/register" className="text-gray-400 hover:text-white text-sm transition-colors">Créer un compte</Link></li>
              <li><Link href="/profil" className="text-gray-400 hover:text-white text-sm transition-colors">Mon profil</Link></li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="font-semibold text-white mb-4">À propos</h4>
            <ul className="space-y-2">
              <li><Link href="/a-propos" className="text-gray-400 hover:text-white text-sm transition-colors">Qui sommes-nous</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Nous contacter</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">CGU</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Politique de confidentialité</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-8">
          <p className="text-gray-500 text-sm">&copy; 2024 YAS Togo. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}

// Main Page Component
export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <WhyChooseSection />
      <RecentOffersSection />
      <Footer />
    </main>
  );
}
