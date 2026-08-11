import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FileText, Mail, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeaturedOffers } from "@/components/shared/featured-offers";
import { BrandLogo } from "@/components/shared/brand-logo";

const CULTURE_IMAGES = [
  {
    src: "/media/culture-1.webp",
    alt: "Collaborateur Yas Togo",
    caption: "Dignité",
  },
  {
    src: "/media/culture-2.webp",
    alt: "Équipe Yas Togo",
    caption: "Collaboration",
  },
  {
    src: "/media/culture-3.webp",
    alt: "Équipe Yas en action",
    caption: "Impact",
  },
] as const;

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="relative isolate min-h-[min(88vh,920px)] overflow-hidden bg-yas-midnight text-white">
        <Image
          src="/media/hero-team.webp"
          alt="Équipe Yas Togo"
          fill
          priority
          className="object-cover object-[center_30%]"
          sizes="100vw"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(105deg, rgba(0,55,125,0.94) 0%, rgba(0,55,125,0.78) 42%, rgba(0,35,80,0.45) 100%),
              linear-gradient(to top, rgba(0,35,80,0.55) 0%, transparent 45%)
            `,
          }}
        />

        <div className="relative mx-auto flex min-h-[min(88vh,920px)] max-w-6xl flex-col justify-center px-4 py-16 sm:px-6 sm:py-24">
          <BrandLogo
            href={null}
            size="hero"
            showWordmark={false}
            className="mb-4 sm:mb-6"
            priority
          />
          <p className="font-heading text-4xl font-bold tracking-tight text-yas-yellow sm:text-6xl md:text-7xl lg:text-8xl">
            YasCareer
          </p>
          <h1 className="mt-4 max-w-2xl font-heading text-xl font-semibold leading-snug text-white sm:mt-5 sm:text-3xl md:text-[2.5rem]">
            Nous recrutons. Construisons l&apos;avenir ensemble.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/80 sm:mt-5 sm:text-lg">
            La plateforme de recrutement Yas Togo — stages et emplois pour
            connecter les talents au 1<sup>er</sup> réseau internet mobile du
            pays.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap">
            <Button
              asChild
              size="lg"
              className="h-12 w-full gap-2 rounded-xl text-base font-semibold sm:w-auto"
            >
              <Link href="/offres">
                Voir les offres
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-20 border-b border-slate-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-yas-sky">
            Simple &amp; clair
          </p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-yas-midnight sm:text-4xl">
            Comment ça marche ?
          </h2>
          <p className="mt-3 max-w-xl text-sm text-slate-500 sm:text-base">
            Postuler chez YAS TOGO en 4 étapes simples.
          </p>

          <ol className="mt-10 grid gap-8 sm:mt-12 sm:grid-cols-4">
            {[
              {
                step: "01",
                title: "Consultez les offres",
                text: "Parcourez nos offres de stage, CDD et CDI disponibles au sein de YAS TOGO.",
              },
              {
                step: "02",
                title: "Créez votre compte",
                text: "Inscrivez-vous gratuitement pour accéder à toutes les fonctionnalités de la plateforme.",
              },
              {
                step: "03",
                title: "Postulez",
                text: "Envoyez votre candidature directement en ligne avec votre CV et votre lettre de motivation.",
              },
              {
                step: "04",
                title: "Suivez votre candidature",
                text: "Recevez des mises à jour en temps réel sur l'avancement de votre dossier.",
              },
            ].map((item) => (
              <li key={item.step} className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="flex size-14 items-center justify-center rounded-full bg-yas-yellow font-heading text-lg font-bold text-yas-midnight shadow-sm">
                  {item.step}
                </div>
                <h3 className="mt-5 font-heading text-lg font-semibold text-yas-midnight">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {item.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <FeaturedOffers limit={6} />

      <section className="bg-[#f4f7fb] py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-yas-sky">
            Culture Yas
          </p>
          <h2 className="mt-2 max-w-2xl font-heading text-2xl font-bold text-yas-midnight sm:text-4xl">
            Let’s grow together
          </h2>
          <p className="mt-3 max-w-xl text-sm text-slate-500 sm:text-base">
            Dignité, collaboration, impact — la culture qui anime les équipes
            Yas Togo au quotidien.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-5">
            {CULTURE_IMAGES.map((img, i) => (
              <figure
                key={img.src}
                className={`group relative overflow-hidden rounded-2xl ${
                  i === 1 ? "sm:mt-8" : ""
                }`}
              >
                <div className="relative aspect-[4/5] w-full">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width:640px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-yas-midnight/80 via-transparent to-transparent" />
                  <figcaption className="absolute bottom-4 left-4 font-heading text-lg font-semibold text-white">
                    {img.caption}
                  </figcaption>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-yas-midnight py-14 text-white sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 top-0 size-72 rounded-full bg-yas-yellow/15 blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-yas-yellow">
            Yas Togo
          </p>
          <h2 className="mt-3 font-heading text-2xl font-bold text-white sm:text-4xl">
            Un lieu où votre croissance compte
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/70 sm:text-lg">
            Top Employer — formation, mobilité interne et culture « Let’s grow
            together ». Votre talent compte pour connecter davantage le Togo.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 h-12 w-full rounded-xl px-8 font-semibold sm:mt-10 sm:w-auto"
          >
            <Link href="/offres">
              Explorer les opportunités
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
