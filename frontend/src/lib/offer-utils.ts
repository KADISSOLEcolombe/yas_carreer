import type { Offer } from "@/lib/types";

export const OFFER_DOMAINS = [
  { id: "digital", label: "Digital & IT" },
  { id: "reseau", label: "Réseau & Infra" },
  { id: "cyber", label: "Cybersécurité" },
  { id: "commercial", label: "Commercial & Ventes" },
  { id: "marketing", label: "Marketing & Com" },
  { id: "rh", label: "RH & Capital humain" },
  { id: "finance", label: "Finance" },
  { id: "juridique", label: "Juridique" },
  { id: "client", label: "Service client" },
] as const;

export type OfferDomainId = (typeof OFFER_DOMAINS)[number]["id"];

const DOMAIN_RULES: { id: OfferDomainId; patterns: RegExp[] }[] = [
  {
    id: "cyber",
    patterns: [/cyber/i, /\bsoc\b/i, /\bsiem\b/i, /sécurité\s+info/i],
  },
  {
    id: "reseau",
    patterns: [
      /réseau\s+radio/i,
      /\bran\b/i,
      /fibre|ftth/i,
      /core\s+network/i,
      /ip\/mpls/i,
      /technicien/i,
      /ingénieur.*réseau/i,
      /réseau.*infra/i,
    ],
  },
  {
    id: "digital",
    patterns: [
      /dévelop/i,
      /flutter|react|typescript|javascript/i,
      /\bux\b|\bui\b|figma/i,
      /product\s+owner/i,
      /helpdesk|support\s+it/i,
      /devops|cloud|kubernetes/i,
      /digitale?\s*\/?\s*it/i,
      /applications?\s+internes/i,
      /data\s+analyst/i,
    ],
  },
  {
    id: "rh",
    patterns: [
      /recrutement|marque\s+employeur/i,
      /\brh\b|ressources?\s+humaines/i,
      /formation.*développement/i,
      /\bsirh\b/i,
      /capital\s+humain/i,
    ],
  },
  {
    id: "finance",
    patterns: [
      /comptable|fiscalité/i,
      /finance|contrôle\s+de\s+gestion/i,
      /budget|reporting\s+financier/i,
    ],
  },
  {
    id: "juridique",
    patterns: [/juriste|juridique|compliance|droit\s+des\s+affaires/i],
  },
  {
    id: "marketing",
    patterns: [
      /marketing/i,
      /community\s+manager/i,
      /communication/i,
      /réseaux\s+sociaux/i,
      /sowe/i,
      /événementiel/i,
    ],
  },
  {
    id: "commercial",
    patterns: [
      /distribution|business\s+development/i,
      /ventes?\s*&?\s*ftth/i,
      /\bvente\b|\bcommercial\b/i,
      /manager\s+réseau/i,
    ],
  },
  {
    id: "client",
    patterns: [
      /clientèle|conseiller/i,
      /contact\s+center|call\s+center/i,
      /\bqos\b|qualité\s+de\s+service/i,
      /service\s+client/i,
    ],
  },
];

export function inferOfferDomain(offer: Pick<Offer, "title" | "description" | "requirements">): OfferDomainId {
  const haystack = `${offer.title}\n${offer.description}\n${offer.requirements ?? ""}`;
  for (const rule of DOMAIN_RULES) {
    if (rule.patterns.some((p) => p.test(haystack))) return rule.id;
  }
  return "digital";
}

export function getDomainLabel(id: OfferDomainId): string {
  return OFFER_DOMAINS.find((d) => d.id === id)?.label ?? id;
}

/** Normalize skill labels for filtering / display. */
export function normalizeSkill(skill: string): string {
  return skill.replace(/\s+/g, " ").trim();
}

export function collectSkillsFromOffers(offers: Offer[], limit = 24): string[] {
  const counts = new Map<string, number>();
  for (const offer of offers) {
    for (const raw of splitSkills(offer.requirements)) {
      const skill = normalizeSkill(raw);
      if (skill.length < 2 || skill.length > 40) continue;
      counts.set(skill, (counts.get(skill) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "fr"))
    .slice(0, limit)
    .map(([skill]) => skill);
}

export function offerMatchesSkills(offer: Offer, skills: string[]): boolean {
  if (skills.length === 0) return true;
  const offerSkills = splitSkills(offer.requirements).map((s) =>
    normalizeSkill(s).toLowerCase()
  );
  const blob = `${offer.title} ${offer.description} ${offer.requirements ?? ""}`.toLowerCase();
  return skills.every((skill) => {
    const needle = skill.toLowerCase();
    return offerSkills.some((s) => s.includes(needle) || needle.includes(s)) || blob.includes(needle);
  });
}

export function offerMatchesQuery(offer: Offer, q: string): boolean {
  const term = q.trim().toLowerCase();
  if (!term) return true;
  const blob = `${offer.title}\n${offer.description}\n${offer.requirements ?? ""}\n${offer.location ?? ""}`.toLowerCase();
  return blob.includes(term);
}

/** Parse structured offer text into titled sections when possible. */
export function parseOfferSections(text: string): { title: string; body: string }[] {
  const lines = text.split(/\r?\n/)
  const sections: { title: string; body: string }[] = []
  let currentTitle = "Présentation"
  let buffer: string[] = []

  const flush = () => {
    const body = buffer.join("\n").trim()
    if (body) sections.push({ title: currentTitle, body })
    buffer = []
  }

  const isHeading = (line: string) => {
    const t = line.trim()
    if (!t) return false
    if (/^(à propos|missions|profil|ce que nous offrons|durée|conditions)/i.test(t)) {
      return t.length < 80 && !t.endsWith(".")
    }
    return false
  }

  for (const line of lines) {
    if (isHeading(line)) {
      flush()
      currentTitle = line.trim()
    } else {
      buffer.push(line)
    }
  }
  flush()
  return sections.length ? sections : [{ title: "Description", body: text }]
}

export function splitSkills(requirements: string | null | undefined): string[] {
  if (!requirements) return []
  return requirements
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/**
 * Score de pertinence simple par mots-clés : nombre de compétences du
 * candidat retrouvées dans le texte "exigences" d'une offre (recherche de
 * sous-chaîne, insensible à la casse). Volontairement basique — pas de
 * modèle IA ici, juste un comptage de correspondances textuelles.
 */
export function scoreOfferForCandidateSkills(
  offerRequirements: string | null | undefined,
  candidateSkills: string[]
): number {
  if (!offerRequirements || candidateSkills.length === 0) return 0;
  const requirementsLower = offerRequirements.toLowerCase();
  let score = 0;
  for (const skill of candidateSkills) {
    const needle = normalizeSkill(skill).toLowerCase();
    if (needle && requirementsLower.includes(needle)) score++;
  }
  return score;
}

/**
 * Classe une liste d'offres par pertinence pour les compétences d'un
 * candidat (chaque offre scorée indépendamment, donc un candidat aux
 * compétences variées peut voir des offres pertinentes dans plusieurs
 * domaines). Retourne un tableau vide si le candidat n'a renseigné aucune
 * compétence — comportement volontairement neutre, pas de fallback.
 */
export function getRelevantOffersForCandidate(
  offers: Offer[],
  candidateSkillsText: string | null | undefined,
  limit = 5
): Offer[] {
  const skills = splitSkills(candidateSkillsText);
  if (skills.length === 0) return [];
  return offers
    .map((offer) => ({
      offer,
      score: scoreOfferForCandidateSkills(offer.requirements, skills),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.offer);
}

export function daysUntil(deadline: string | null | undefined): number | null {
  if (!deadline) return null
  const d = new Date(deadline)
  if (Number.isNaN(d.getTime())) return null
  const diff = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return diff
}

/**
 * "Clôturée" est dérivé de `deadline`, jamais d'un champ stocké — le RH garde
 * la main sur `status` et peut prolonger la deadline pour rouvrir les
 * candidatures. Reste cohérent avec la candidature possible jusqu'à la fin
 * du jour de la deadline (même logique que le blocage côté backend).
 */
export function isOfferExpired(deadline: string | null | undefined): boolean {
  const days = daysUntil(deadline)
  return days !== null && days < 0
}
