'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Lock, Mail, ShieldCheck, User } from 'lucide-react';

const COLORS = {
  midnight: '#1e3a8a',
  midnightDark: '#152a5e',
  yellow: '#facc15',
  text: {
    primary: '#1A1A1A',
    secondary: '#4B5563',
  },
  border: '#E5E7EB',
};

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, isAuthenticated, isCandidate } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const message = searchParams.get('message');

  useEffect(() => {
    if (isAuthenticated && isCandidate) {
      router.push(redirect);
    }
  }, [isAuthenticated, isCandidate, router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (!acceptTerms) {
      setError("Vous devez accepter les Conditions d'Utilisation et la Politique de Confidentialité");
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name, email, password);
      router.push(redirect);
    } catch (err) {
      setError("Une erreur est survenue lors de l'inscription");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Colonne gauche - partie décorative */}
      <div
        className="relative flex flex-col items-center justify-center px-8 py-16 lg:min-h-screen overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${COLORS.midnight} 0%, ${COLORS.midnightDark} 100%)`,
        }}
      >
        {/* Motif quadrillé subtil */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)',
            backgroundSize: '38px 38px',
          }}
        />

        <Link
          href="/"
          className="absolute left-6 top-6 inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          Retour à l'accueil
        </Link>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div
            className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl shadow-lg"
            style={{ backgroundColor: COLORS.midnightDark }}
          >
            <span className="text-3xl font-extrabold italic tracking-tight" style={{ color: COLORS.yellow }}>
              yas
            </span>
          </div>

          <h1 className="mb-3 text-3xl font-extrabold text-white sm:text-4xl">YAS Togo HR</h1>
          <p className="max-w-sm text-sm text-white/70 sm:text-base">
            La plateforme de gestion des talents pour le marché togolais.
          </p>
        </div>
      </div>

      {/* Colonne droite - formulaire */}
      <div className="flex items-center justify-center bg-white px-6 py-12 sm:px-10 lg:py-16">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold" style={{ color: COLORS.midnight }}>
            Créer un compte
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Créez votre compte pour postuler et suivre vos candidatures
          </p>

          {message === 'auth_required' && (
            <div className="mt-6 rounded-r-md border-l-4 bg-blue-50 p-4" style={{ borderColor: COLORS.midnight }}>
              <h4 className="mb-1 font-semibold text-blue-800">Inscription requise</h4>
              <p className="text-sm text-blue-700">Vous devez créer un compte pour accéder à cette page.</p>
            </div>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
            )}

            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-semibold" style={{ color: COLORS.midnight }}>
                Nom Complet
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <User size={18} />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': COLORS.yellow } as React.CSSProperties}
                  placeholder="Jean Dupont"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold" style={{ color: COLORS.midnight }}>
                Adresse Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': COLORS.yellow } as React.CSSProperties}
                  placeholder="nom@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold" style={{ color: COLORS.midnight }}>
                Mot de passe
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': COLORS.yellow } as React.CSSProperties}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold"
                style={{ color: COLORS.midnight }}
              >
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <ShieldCheck size={18} />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': COLORS.yellow } as React.CSSProperties}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <label className="flex items-start gap-2.5 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300"
                style={{ accentColor: COLORS.midnight }}
              />
              <span>
                J&apos;accepte les{' '}
                <a href="#" className="font-medium hover:underline" style={{ color: COLORS.midnight }}>
                  Conditions d&apos;Utilisation
                </a>{' '}
                et la{' '}
                <a href="#" className="font-medium hover:underline" style={{ color: COLORS.midnight }}>
                  Politique de Confidentialité
                </a>
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-gray-900 shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              style={{ backgroundColor: COLORS.yellow }}
            >
              {isSubmitting ? 'Inscription en cours...' : "S'inscrire"}
              {!isSubmitting && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="mt-8 border-t border-gray-200 pt-6 text-center">
            <p className="mb-3 text-sm text-gray-500">Déjà un compte ?</p>
            <Link
              href={`/login?redirect=${redirect}`}
              className="block w-full rounded-xl border py-3 text-sm font-bold transition-colors hover:bg-blue-50"
              style={{ borderColor: COLORS.midnight, color: COLORS.midnight }}
            >
              Se connecter
            </Link>
          </div>

          <p className="mt-8 text-center text-xs text-gray-400">© 2024 YAS Togo HR. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
}
