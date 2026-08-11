"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Target, Heart, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* SECTION QUI SOMMES-NOUS AVEC DESIGN DIAGONAL */}
      <section className="relative isolate min-h-[550px] overflow-hidden bg-yas-midnight text-white flex items-center py-16 sm:py-24">
        {/* Image de l'équipe à droite */}
        <div className="absolute inset-y-0 right-0 w-full md:w-[60%] z-0">
          <Image
            src="/media/hero-team.webp"
            alt="Équipe Yas Togo"
            fill
            priority
            className="object-cover object-[center_30%]"
            sizes="100vw"
          />
          {/* Overlay dégradé sombre sur l'image pour la lisibilité sur mobile */}
          <div className="absolute inset-0 bg-yas-midnight/40 md:bg-transparent" />
        </div>

        {/* Forme diagonale jaune inspirée du logo et de la charte YAS */}
        <div 
          className="absolute inset-y-0 left-0 w-[55%] z-10 hidden md:block"
          style={{
            clipPath: "polygon(0 0, 100% 0, 75% 100%, 0 100%)",
            background: "linear-gradient(135deg, #ffd100 0%, #ffc107 100%)",
          }}
        />

        {/* Overlay bleu nuit dégradé par-dessus la forme jaune à gauche pour écrire le texte blanc/noir en harmonie */}
        <div 
          className="absolute inset-y-0 left-0 w-[48%] z-20 hidden md:block"
          style={{
            clipPath: "polygon(0 0, 100% 0, 78% 100%, 0 100%)",
            background: "linear-gradient(to right, rgba(0,55,125,1) 0%, rgba(0,55,125,0.95) 75%, rgba(0,55,125,0.9) 100%)",
          }}
        />

        {/* Version Mobile: Dégradé complet bleu nuit vers transparent */}
        <div className="absolute inset-0 z-20 bg-gradient-to-r from-yas-midnight via-yas-midnight/90 to-transparent md:hidden" />

        <div className="relative z-30 mx-auto w-full max-w-5xl px-4 sm:px-6">
          {/* Bouton Retour à l'accueil */}
          <div className="flex justify-start mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-white/90 hover:text-yas-yellow transition-colors group"
            >
              <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
              Retour à l&apos;accueil
            </Link>
          </div>

          {/* Badge Qui sommes-nous */}
          <div className="flex justify-start mb-6">
            <div className="inline-block bg-yas-yellow text-yas-midnight px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
              Qui sommes-nous
            </div>
          </div>

          {/* Titre principal */}
          <h1 className="max-w-2xl font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            YAS TOGO, votre partenaire <span className="text-yas-yellow font-extrabold">emploi</span>
          </h1>

          {/* Description */}
          <p className="mt-6 text-base leading-relaxed text-white/80 sm:text-lg max-w-xl">
            Youth Employment Support (YAS) TOGO est une organisation engagée dans le
            développement de l&apos;employabilité des jeunes togolais. Notre plateforme
            digitalise et centralise l&apos;ensemble du processus de recrutement.
          </p>
        </div>
      </section>

      {/* SECTION CE QUI NOUS ANIME */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold text-yas-midnight sm:text-4xl">
              Ce qui nous anime
            </h2>
            <p className="mt-3 max-w-xl mx-auto text-base text-slate-500">
              Nous croyons que chaque talent mérite d&apos;être valorisé. Voici les principes qui
              guident notre action.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {[
              {
                icon: Target,
                title: "Notre mission",
                text: "Connecter les jeunes talents togolais aux meilleures opportunités professionnelles au sein de YAS TOGO, en facilitant un recrutement transparent et efficace.",
              },
              {
                icon: Heart,
                title: "Nos valeurs",
                text: "Intégrité, excellence et inclusion. Nous croyons en l'égalité des chances pour tous les candidats et en la promotion des talents locaux.",
              },
              {
                icon: Users,
                title: "Notre équipe",
                text: "Une équipe dynamique et passionnée, engagée à soutenir le développement économique du Togo en valorisant chaque candidature.",
              },
              {
                icon: Award,
                title: "Notre engagement",
                text: "Offrir une expérience de recrutement moderne, rapide et humaine, tant pour les candidats que pour nos équipes RH internes.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex gap-4 p-6 rounded-2xl border border-slate-100 bg-[#fbfcfd] shadow-sm hover:shadow-md transition duration-300"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-yas-yellow text-yas-midnight">
                  <item.icon className="size-6" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-yas-midnight">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION READY TO JOIN */}
      <section className="relative overflow-hidden bg-white border-t border-slate-100 py-16 sm:py-24 text-center">
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 z-10">
          <h2 className="font-heading text-3xl font-bold text-yas-midnight sm:text-4xl">
            Prêt à rejoindre YAS TOGO ?
          </h2>
          <p className="mt-4 text-base text-slate-500">
            Consultez nos offres disponibles et lancez votre candidature dès aujourd&apos;hui.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 w-full sm:w-auto px-8 bg-yas-yellow text-yas-midnight hover:bg-yas-yellow/90 font-semibold border-none rounded-xl"
            >
              <Link href="/offres">
                Voir les offres
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 w-full sm:w-auto px-8 border-slate-200 text-yas-midnight hover:bg-slate-50 rounded-xl"
            >
              <Link href="/register">Créer un compte</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
