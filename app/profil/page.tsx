'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Briefcase, Clock, LogOut, CheckCircle, XCircle, Eye, Users } from 'lucide-react';
import { getUserApplications, STATUS_LABELS, type Application } from '../../lib/applications';
import { getNotificationsForUser } from '../../lib/notifications';

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

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, isRecruiter, logout } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<ReturnType<typeof getNotificationsForUser>>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/profil&message=auth_required');
    }
    if (!isLoading && isRecruiter) {
      router.push('/rh/dashboard');
    }
  }, [isAuthenticated, isLoading, isRecruiter, router]);

  useEffect(() => {
    if (user) {
      setApplications(getUserApplications(user.id));
      setNotifications(getNotificationsForUser(user.id));
    }
  }, [user]);

  const getStatusColor = (status: string) => {
    const label = STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status;
    switch (status) {
      case 'PENDING':
        return { bg: '#FFF7D6', text: '#854D0E', label };
      case 'IN_REVIEW':
        return { bg: '#DBEAFE', text: '#1E40AF', label };
      case 'INTERVIEW':
        return { bg: '#EDE9FE', text: '#6D28D9', label };
      case 'ACCEPTED':
        return { bg: '#D1FAE5', text: '#065F46', label };
      case 'REJECTED':
        return { bg: '#FEE2E2', text: '#DC2626', label };
      default:
        return { bg: '#F3F4F6', text: '#4B5563', label };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'IN_REVIEW':
        return <Clock size={16} />;
      case 'INTERVIEW':
        return <Eye size={16} />;
      case 'ACCEPTED':
        return <CheckCircle size={16} />;
      case 'REJECTED':
        return <XCircle size={16} />;
      default:
        return null;
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2" style={{ borderColor: COLORS.midnight }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors">
            <ArrowLeft size={16} />
            Retour à l'accueil
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sticky top-24">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center text-gray-900 text-xl font-bold"
                    style={{ backgroundColor: COLORS.yellow }}
                  >
                    {user?.nom.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{user?.nom}</h3>
                    <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
                
                <nav className="space-y-1">
                  <div 
                    className="flex items-center gap-3 px-4 py-3 rounded-md font-bold text-gray-900 shadow-sm"
                    style={{ backgroundColor: COLORS.yellow }}
                  >
                    <Briefcase size={18} />
                    Mes candidatures
                  </div>
                  <div 
                    className="flex items-center gap-3 px-4 py-3 rounded-md text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <User size={18} />
                    Mon profil
                  </div>
                </nav>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left rounded-md text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={18} />
                    Déconnexion
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                  <div>
                    <h1 className="text-2xl font-bold mb-1" style={{ color: COLORS.midnight }}>
                      Mes candidatures
                    </h1>
                    <p style={{ color: COLORS.text.secondary }}>
                      {applications.length} candidature{applications.length > 1 ? 's' : ''} en cours
                    </p>
                  </div>
                  <Link
                    href="/offres"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md font-bold text-gray-900 transition-all hover:opacity-90 shadow-sm"
                    style={{ backgroundColor: COLORS.yellow }}
                  >
                    <Briefcase size={18} />
                    Trouver de nouvelles offres
                  </Link>
                </div>

                {applications.length === 0 ? (
                  <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
                    <Briefcase size={40} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.text.primary }}>
                      Aucune candidature pour le moment
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Commencez à postuler à des offres pour suivre l'évolution de vos candidatures depuis cette page.
                    </p>
                    <Link
                      href="/offres"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-bold text-gray-900 transition-all hover:opacity-90 shadow-sm"
                      style={{ backgroundColor: COLORS.yellow }}
                    >
                      Découvrir les offres
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => {
                      const statusInfo = getStatusColor(app.status);
                      return (
                        <div key={app.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-lg mb-1" style={{ color: COLORS.text.primary }}>
                                {app.jobTitle}
                              </h4>
                              <p className="text-sm text-gray-500 mb-3">
                                Candidature envoyée le {new Date(app.createdAt).toLocaleDateString('fr-FR')}
                              </p>
                              <div className="flex items-center gap-2">
                                <span 
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                                  style={{ backgroundColor: statusInfo.bg, color: statusInfo.text }}
                                >
                                  {getStatusIcon(app.status)}
                                  {statusInfo.label}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Link
                                href={`/offres/${app.jobId}`}
                                className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Eye size={16} />
                                Voir l'offre
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {notifications.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h2 className="text-lg font-semibold mb-4" style={{ color: COLORS.midnight }}>
                      Mes notifications
                    </h2>
                    <div className="space-y-3">
                      {notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          className={`border rounded-lg p-4 ${n.read ? 'border-gray-100 bg-gray-50' : 'border-blue-100 bg-blue-50'}`}
                        >
                          <p className="font-medium text-gray-900 text-sm">{n.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(n.createdAt).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
