'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Target, Users, Award, Heart } from 'lucide-react';

const COLORS = {
  yellow: '#FFD100',
  midnight: '#00377D',
  text: {
    primary: '#1A1A1A',
    secondary: '#4B5563',
    muted: '#9CA3AF',
  },
  border: '#E5E7EB',
};

export default function AboutPage() {
  const values = [
    {
      icon: <Target size={28} />,
      title: 'Notre mission',
      description:
        'Connecter les jeunes talents togolais aux meilleures opportunités professionnelles au sein de YAS TOGO, en facilitant un recrutement transparent et efficace.',
    },
    {
      icon: <Heart size={28} />,
      title: 'Nos valeurs',
      description:
        "Intégrité, excellence et inclusion. Nous croyons en l'égalité des chances pour tous les candidats et en la promotion des talents locaux.",
    },
    {
      icon: <Users size={28} />,
      title: 'Notre équipe',
      description:
        'Une équipe dynamique et passionnée, engagée à soutenir le développement économique du Togo en valorisant chaque candidature.',
    },
    {
      icon: <Award size={28} />,
      title: 'Notre engagement',
      description:
        'Offrir une expérience de recrutement moderne, rapide et humaine, tant pour les candidats que pour nos équipes RH internes.',
    },
  ];

  const steps = [
    { number: '01', title: 'Consultez les offres', description: 'Parcourez nos offres de stage, CDD et CDI disponibles au sein de YAS TOGO.' },
    { number: '02', title: 'Créez votre compte', description: 'Inscrivez-vous gratuitement pour accéder à toutes les fonctionnalités de la plateforme.' },
    { number: '03', title: 'Postulez', description: 'Envoyez votre candidature directement en ligne avec votre CV et votre lettre de motivation.' },
    { number: '04', title: 'Suivez votre candidature', description: 'Recevez des mises à jour en temps réel sur l\'avancement de votre dossier.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <img src="/yas-logo.svg" alt="YAS Togo" className="h-12 w-auto" />
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight" style={{ color: COLORS.midnight }}>
                  YAS Togo
                </span>
                <span className="text-xs leading-tight" style={{ color: COLORS.text.muted }}>
                  Youth Employment Support
                </span>
              </div>
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/offres" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Nos offres
              </Link>
              <Link href="/a-propos" className="font-medium transition-colors" style={{ color: COLORS.midnight }}>
                À propos
              </Link>
            </nav>
            <div className="flex items-center space-x-3">
              <Link
                href="/login"
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 font-medium text-sm transition-colors"
              >
                Se connecter
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-gray-900 rounded-md font-medium text-sm transition-all hover:opacity-90"
                style={{ backgroundColor: COLORS.yellow }}
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-16">
        {/* Hero */}
        <section className="py-20" style={{ backgroundColor: COLORS.midnight }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-8 transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              Retour à l'accueil
            </Link>
            <div className="inline-block px-6 py-2 rounded-full mb-6" style={{ backgroundColor: COLORS.yellow }}>
              <span className="text-sm font-bold" style={{ color: COLORS.midnight }}>
                QUI SOMMES-NOUS
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
              YAS TOGO, votre partenaire{' '}
              <span style={{ color: COLORS.yellow }}>emploi</span>
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Youth Employment Support (YAS) TOGO est une organisation engagée dans le développement de l'employabilité des jeunes togolais.
              Notre plateforme digitalise et centralise l'ensemble du processus de recrutement.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold mb-4" style={{ color: COLORS.midnight }}>
                Ce qui nous anime
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Nous croyons que chaque talent mérite d'être valorisé. Voici les principes qui guident notre action.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((v, i) => (
                <div key={i} className="flex gap-5 p-6 border border-gray-200 rounded-xl hover:shadow-sm transition-all">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: COLORS.yellow, color: COLORS.midnight }}
                  >
                    {v.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2" style={{ color: COLORS.midnight }}>
                      {v.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm">{v.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold mb-4" style={{ color: COLORS.midnight }}>
                Comment ça marche ?
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Postuler chez YAS TOGO en 4 étapes simples.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, i) => (
                <div key={i} className="text-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 text-2xl font-bold"
                    style={{ backgroundColor: COLORS.yellow, color: COLORS.midnight }}
                  >
                    {step.number}
                  </div>
                  <h3 className="font-semibold text-lg mb-2" style={{ color: COLORS.midnight }}>
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4" style={{ color: COLORS.midnight }}>
              Prêt à rejoindre YAS TOGO ?
            </h2>
            <p className="text-gray-500 mb-8">
              Consultez nos offres disponibles et lancez votre candidature dès aujourd'hui.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/offres"
                className="px-8 py-4 font-bold rounded-lg text-gray-900 transition-all hover:opacity-90 shadow-sm"
                style={{ backgroundColor: COLORS.yellow }}
              >
                Voir les offres
              </Link>
              <Link
                href="/register"
                className="px-8 py-4 font-bold rounded-lg text-gray-700 border-2 border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
