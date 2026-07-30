/** Slides du carousel d’accueil / candidature — remplacer les src quand les photos finales arrivent. */
export type HeroSlide = {
  src: string;
  alt: string;
};

export const HERO_SLIDES: HeroSlide[] = [
  {
    src: '/image1.webp',
    alt: 'Équipe YAS Togo collaborant autour d’un ordinateur',
  },
  {
    src: '/image1.webp',
    alt: 'Opportunités de stage et d’emploi chez YAS Togo',
  },
  {
    src: '/image1.webp',
    alt: 'Jeunes talents accompagnés par YAS Togo',
  },
];

export const APPLY_SLIDES: HeroSlide[] = [
  {
    src: '/image1.webp',
    alt: 'Candidature YAS — environnement de travail',
  },
  {
    src: '/image1.webp',
    alt: 'Candidature YAS — équipe dynamique',
  },
  {
    src: '/image1.webp',
    alt: 'Candidature YAS — opportunités de carrière',
  },
];
