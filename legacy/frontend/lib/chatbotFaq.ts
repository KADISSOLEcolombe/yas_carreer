export type FaqAnswer = {
  text: string;
  links?: { label: string; href: string }[];
};

type FaqEntry = {
  id: string;
  keywords: string[];
  answer: FaqAnswer;
};

const FAQ: FaqEntry[] = [
  {
    id: 'postuler',
    keywords: ['postuler', 'candidature', 'candidater', 'envoyer cv', 'comment postuler'],
    answer: {
      text: 'Pour postuler : ouvrez une offre, cliquez sur « Postuler », puis joignez votre CV et votre lettre de motivation. Un compte candidat est requis.',
      links: [
        { label: 'Voir les offres', href: '/offres' },
        { label: 'Créer un compte', href: '/register' },
      ],
    },
  },
  {
    id: 'candidatures',
    keywords: ['mes candidatures', 'suivi', 'statut', 'où voir', 'historique'],
    answer: {
      text: 'Retrouvez toutes vos candidatures et leur statut dans votre espace candidat, onglet « Mes candidatures ».',
      links: [{ label: 'Mon espace', href: '/profil' }],
    },
  },
  {
    id: 'entretien',
    keywords: ['entretien', 'visio', 'meet', 'zoom', 'rejoindre', 'lien'],
    answer: {
      text: 'Quand un entretien est planifié, consultez « Mes entretiens ». Pour une visioconférence, le bouton « Rejoindre » ouvre le lien Meet / Zoom / Jitsi reçu aussi par e-mail.',
      links: [{ label: 'Mes entretiens', href: '/profil' }],
    },
  },
  {
    id: 'compte',
    keywords: ['compte', 'inscription', 'créer', 'register', 's’inscrire', "s'inscrire"],
    answer: {
      text: 'Créez un compte gratuitement avec votre e-mail. Vous pourrez ensuite postuler et suivre vos dossiers.',
      links: [{ label: 'Créer un compte', href: '/register' }],
    },
  },
  {
    id: 'favoris',
    keywords: ['favori', 'favoris', 'sauvegarder', 'bookmark'],
    answer: {
      text: 'Sur une carte d’offre, cliquez sur le cœur pour l’ajouter aux favoris. Retrouvez-les dans votre espace, onglet « Mes favoris ».',
      links: [{ label: 'Mes favoris', href: '/profil' }],
    },
  },
  {
    id: 'connexion',
    keywords: ['connexion', 'login', 'mot de passe', 'connecter'],
    answer: {
      text: 'Connectez-vous avec l’e-mail et le mot de passe de votre compte candidat.',
      links: [{ label: 'Se connecter', href: '/login' }],
    },
  },
  {
    id: 'offres',
    keywords: ['offre', 'stage', 'emploi', 'cdi', 'cdd', 'opportun'],
    answer: {
      text: 'Les offres de stage, CDD et CDI YAS Togo sont listées sur la page Offres. Vous pouvez filtrer par type et département.',
      links: [{ label: 'Nos offres', href: '/offres' }],
    },
  },
];

const FALLBACK: FaqAnswer = {
  text: 'Je n’ai pas trouvé de réponse précise. Essayez : « comment postuler », « mes candidatures », « rejoindre un entretien » ou « créer un compte ».',
  links: [
    { label: 'Voir les offres', href: '/offres' },
    { label: 'Aide — À propos', href: '/a-propos' },
  ],
};

export function matchFaq(question: string): FaqAnswer {
  const q = question
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  let best: { score: number; answer: FaqAnswer } | null = null;

  for (const entry of FAQ) {
    let score = 0;
    for (const kw of entry.keywords) {
      const k = kw
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      if (q.includes(k)) score += k.length;
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { score, answer: entry.answer };
    }
  }

  return best?.answer || FALLBACK;
}
