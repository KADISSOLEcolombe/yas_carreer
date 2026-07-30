'use client';

import Link from 'next/link';
import { ArrowLeft, Target, Users, Award, Heart } from 'lucide-react';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="pt-16">
        {/* Hero */}
        <section className="bg-yas-midnight py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-8 transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              Retour à l'accueil
            </Link>
            <div className="mb-6 inline-block rounded-full bg-primary px-6 py-2">
              <span className="text-sm font-bold text-yas-midnight">
                QUI SOMMES-NOUS
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
              YAS TOGO, votre partenaire{' '}
              <span className="text-yas-yellow">emploi</span>
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
              <h2 className="mb-4 text-3xl font-bold text-yas-midnight">
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
                    className="flex size-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"
                  >
                    {v.icon}
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-yas-midnight">
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
              <h2 className="mb-4 text-3xl font-bold text-yas-midnight">
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
                    className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground"
                  >
                    {step.number}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-yas-midnight">
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
            <h2 className="mb-4 text-3xl font-bold text-yas-midnight">
              Prêt à rejoindre YAS TOGO ?
            </h2>
            <p className="text-gray-500 mb-8">
              Consultez nos offres disponibles et lancez votre candidature dès aujourd'hui.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/offres"
                className={cn(buttonVariants({ size: 'lg' }), 'h-12 px-8 text-base font-bold')}
              >
                Voir les offres
              </Link>
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: 'lg', variant: 'outline' }),
                  'h-12 px-8 text-base font-bold'
                )}
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </section>
      </div>
      <SiteFooter />
    </div>
  );
}
