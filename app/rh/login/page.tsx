'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Mail, Shield } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { COLORS } from '../../../lib/constants';
import { resetUsersRegistry } from '../../../lib/users';

export default function RHLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { loginRH, isRecruiter, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isRecruiter) {
      router.push('/rh/dashboard');
    }
  }, [isLoading, isRecruiter, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await loginRH(email, password);
      router.push('/rh/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Identifiants invalides');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (confirm('Réinitialiser tous les utilisateurs aux valeurs par défaut ?')) {
      resetUsersRegistry();
      setError('');
      setEmail('');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Retour à l'accueil
        </Link>

        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <div className="text-center mb-8">
            <div
              className="w-14 h-14 rounded-md flex items-center justify-center mx-auto mb-4 text-gray-900 font-bold text-lg"
              style={{ backgroundColor: COLORS.yellow }}
            >
              <Shield size={28} style={{ color: COLORS.midnight }} />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.midnight }}>
              Espace RH
            </h2>
            <p className="text-gray-600 text-sm">
              Connexion réservée aux responsables RH et administrateurs
            </p>
          </div>

          <div className="mb-6 bg-blue-50 border border-blue-100 rounded-md p-4 text-sm text-blue-800">
            <p className="font-medium mb-1">Compte de démonstration</p>
            <p>Email : <strong>rh@yastogo.tg</strong></p>
            <p>Mot de passe : <strong>rh123456</strong></p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-2 text-xs underline text-blue-600 hover:text-blue-800"
            >
              Réinitialiser les utilisateurs
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email professionnel</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rh@yastogo.tg"
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-md font-bold text-gray-900 transition-all hover:opacity-90 disabled:opacity-70"
              style={{ backgroundColor: COLORS.yellow }}
            >
              {isSubmitting ? 'Connexion...' : 'Accéder à l\'espace RH'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Vous êtes candidat ?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
              Connexion candidat
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
