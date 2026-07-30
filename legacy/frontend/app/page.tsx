'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Award,
  Building2,
  ChevronRight,
  ClipboardCheck,
  Search,
  Send,
  UserPlus,
  Users,
} from 'lucide-react';
import { api, mapOffre, type Job } from '@/lib/api';
import JobOfferCard from '@/components/JobOfferCard';
import HeroCarousel from '@/components/HeroCarousel';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { HERO_SLIDES } from '@/lib/heroSlides';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function HeroSection() {
  return (
    <section className="relative flex h-[100svh] min-h-[560px] w-full items-end overflow-hidden pb-16 sm:items-center sm:pb-0">
      <HeroCarousel
        slides={HERO_SLIDES}
        priority
        sizes="100vw"
        className="absolute inset-0 z-0"
        overlayClassName="absolute inset-0 bg-gradient-to-r from-yas-midnight/90 via-yas-midnight/70 to-yas-midnight/35"
        showDots
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <img
            src="/jm.svg"
            alt="YAS Togo"
            className="animate-yas-fade-up mb-8 h-16 w-auto drop-shadow-lg sm:h-20"
          />
          <h1 className="animate-yas-fade-up animate-yas-delay-1 text-4xl leading-[1.1] font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Ton stage ou ton emploi
            <span className="mt-1 block text-yas-yellow">chez YAS Togo</span>
          </h1>
          <p className="animate-yas-fade-up animate-yas-delay-2 mt-5 max-w-md text-base text-white/85 sm:text-lg">
            Opportunités vérifiées. Candidature en ligne. Suivi clair jusqu’à l’entretien.
          </p>
          <div className="animate-yas-fade-up animate-yas-delay-3 mt-9 flex flex-wrap gap-3">
            <Link
              href="/offres"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'h-12 px-7 text-base font-semibold shadow-lg shadow-black/20 transition-transform hover:scale-[1.02]'
              )}
            >
              Voir les offres
            </Link>
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: 'lg', variant: 'outline' }),
                'h-12 border-white/50 bg-white/10 px-7 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white'
              )}
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      icon: Search,
      title: 'Explorez',
      description: 'Stages, CDD et CDI publiés par YAS Togo.',
    },
    {
      icon: UserPlus,
      title: 'Inscrivez-vous',
      description: 'Profil gratuit en quelques minutes.',
    },
    {
      icon: Send,
      title: 'Postulez',
      description: 'CV et lettre de motivation en ligne.',
    },
    {
      icon: ClipboardCheck,
      title: 'Suivez',
      description: 'Statuts, entretiens et notifications.',
    },
  ];

  return (
    <section
      id="comment-ca-marche"
      className="scroll-mt-20 border-b border-border bg-background py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 max-w-xl">
          <h2 className="text-3xl font-bold tracking-tight text-yas-midnight sm:text-4xl">
            Comment ça marche
          </h2>
          <p className="mt-3 text-muted-foreground sm:text-lg">
            Quatre étapes pour candidater chez YAS Togo.
          </p>
        </div>

        <ol className="relative grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          <div
            className="pointer-events-none absolute top-7 right-0 left-0 hidden h-px bg-gradient-to-r from-yas-midnight/20 via-primary to-yas-midnight/20 lg:block"
            aria-hidden
          />
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                className="group relative animate-yas-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-yas-midnight text-white shadow-md transition-transform duration-300 group-hover:-translate-y-1 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon size={22} />
                </div>
                <p className="mb-1 text-xs font-bold tracking-widest text-yas-sky uppercase">
                  Étape {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="mb-2 text-xl font-semibold text-yas-midnight">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function WhyChooseSection() {
  const benefits = [
    {
      icon: Award,
      title: 'Offres vérifiées',
      description: 'Chaque annonce est validée par l’équipe RH YAS Togo.',
    },
    {
      icon: Building2,
      title: 'Impact local',
      description: 'Rejoignez une organisation engagée pour l’emploi des jeunes au Togo.',
    },
    {
      icon: Users,
      title: 'Suivi humain',
      description: 'De la candidature à l’entretien, votre dossier reste visible et suivi.',
    },
  ];

  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,209,0,0.12),_transparent_55%),radial-gradient(ellipse_at_bottom_left,_rgba(0,55,125,0.08),_transparent_50%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 max-w-xl">
          <h2 className="text-3xl font-bold tracking-tight text-yas-midnight sm:text-4xl">
            Pourquoi YAS Career
          </h2>
          <p className="mt-3 text-muted-foreground sm:text-lg">
            Une plateforme de recrutement pensée pour les candidats togolais.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-12 gap-y-12 md:grid-cols-3">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="animate-yas-fade-up border-t-2 border-yas-midnight/15 pt-6 transition-colors hover:border-primary"
                style={{ animationDelay: `${index * 0.12}s` }}
              >
                <Icon className="mb-4 size-7 text-yas-midnight" strokeWidth={1.75} />
                <h3 className="mb-2 text-xl font-semibold text-yas-midnight">{benefit.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function RecentOffersSection() {
  const [offers, setOffers] = useState<Job[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const apiOffres = await api.getOffres();
        if (!cancelled) {
          setOffers(apiOffres.map(mapOffre).slice(0, 6));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des offres récentes:', error);
        if (!cancelled) setOffers([]);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="bg-yas-midnight py-20 text-white sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">Offres à la une</h2>
            <p className="text-white/70">Les opportunités les plus récentes chez YAS Togo</p>
          </div>
          <Link
            href="/offres"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'hidden h-11 w-fit font-semibold sm:inline-flex'
            )}
          >
            Toutes les offres
            <ChevronRight className="size-4" />
          </Link>
        </div>

        {!loaded ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} size="sm" className="bg-white">
                <CardHeader>
                  <Skeleton className="size-8 rounded-lg" />
                  <Skeleton className="mt-2 h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : offers.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => (
              <JobOfferCard key={offer.id} job={offer} />
            ))}
          </div>
        ) : (
          <Card className="bg-white text-foreground">
            <CardHeader>
              <CardTitle>Aucune offre pour le moment</CardTitle>
              <CardDescription>
                Revenez bientôt — de nouvelles opportunités sont publiées régulièrement.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <div className="mt-10 text-center sm:hidden">
          <Link href="/offres" className={cn(buttonVariants({ size: 'lg' }), 'font-semibold')}>
            Toutes les offres
          </Link>
        </div>
      </div>
    </section>
  );
}

function ClosingCtaSection() {
  return (
    <section className="border-t border-border bg-gradient-to-br from-accent via-background to-muted py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <img src="/jm.svg" alt="" className="mx-auto mb-6 h-12 w-auto opacity-90" aria-hidden />
        <h2 className="text-3xl font-bold tracking-tight text-yas-midnight sm:text-4xl">
          Prêt à candidater ?
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground sm:text-lg">
          Créez votre compte et postulez aux offres YAS Togo en quelques minutes.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register"
            className={cn(buttonVariants({ size: 'lg' }), 'h-12 px-8 text-base font-semibold')}
          >
            Créer un compte
          </Link>
          <Link
            href="/a-propos"
            className={cn(
              buttonVariants({ size: 'lg', variant: 'outline' }),
              'h-12 px-8 text-base font-semibold'
            )}
          >
            En savoir plus
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <SiteHeader transparentOnTop />
      <HeroSection />
      <HowItWorksSection />
      <WhyChooseSection />
      <RecentOffersSection />
      <ClosingCtaSection />
      <SiteFooter />
    </main>
  );
}
