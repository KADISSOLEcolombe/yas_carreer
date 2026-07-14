'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getJobs, type Job } from '../lib/jobs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ChevronRight, Search, Building, Users, Award, LogOut } from 'lucide-react';
import JobOfferCard from '../components/JobOfferCard';

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
            <img src="/yas-logo.svg" alt="YAS Togo" className="h-12 w-auto" />

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
            {isMenuOpen ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="18" y2="18" /></svg>}
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
  return (
    <section className="relative w-full h-[85vh] min-h-[600px] flex items-center overflow-hidden pt-16">
      {/* COUCHE 1 : Photo de fond + voile bleu foncé avec opacité responsive */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/image1.webp"
          alt="Équipe souriante de YAS Togo travaillant ensemble autour d'un ordinateur"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#1e3a8a] opacity-60 md:opacity-35 transition-opacity duration-300" />
      </div>

      {/* COUCHE 2 : Forme organique jaune (décoration absolute à gauche) */}
      <div className="absolute left-[-10%] top-[-15%] w-[90%] md:w-[85%] lg:w-[70%] h-[135%] pointer-events-none z-[1] hidden md:block opacity-95">
        <img
          src="/logo2.svg"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-contain object-left-top"
        />
      </div>

      {/* COUCHE 3 : Contenu (uniquement le titre) */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-full md:max-w-[50%] lg:max-w-[44%] xl:max-w-[40%] text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold leading-tight text-white md:text-[#1e3a8a] transition-colors duration-300">
            Trouve ton <span className="text-[#facc15] md:text-[#3b82f6]">stage</span> ou ton emploi a yas Togo !
          </h1>
        </div>
      </div>

      {/* COUCHE 4 : Logo YAS en petit en bas à droite */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-8 z-10 w-20 sm:w-28 opacity-95">
        <img
          src="/logo_yas.svg"
          alt="Yas Logo"
          className="h-8 sm:h-10 w-auto ml-auto"
        />
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
            <div key={index} className="p-8 rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {offers.map((offer) => (
              <JobOfferCard key={offer.id} job={offer} />
            ))}
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
              <img src="/yas-logo.svg" alt="YAS Togo" className="h-12 w-auto" />
              <div className="flex flex-col">
                <span className="font-bold text-white">YAS Togo</span>
                <span className="text-xs text-gray-300">Youth Employment Support</span>
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
