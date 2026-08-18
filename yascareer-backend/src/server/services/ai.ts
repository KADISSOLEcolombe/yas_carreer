import OpenAI from "openai";
import type { Application, Offer } from "@prisma/client";
import { env } from "@/server/env";

type MatchResult = {
  score: number;
  summary: string;
  strengths?: string[];
  gaps?: string[];
  recommendation?: "retenir" | "a_envisager" | "ecarter";
  webFindings?: string;
};

type CvExtraction = {
  bio?: string | null;
  skills?: string[];
  experiences?: string[];
  formations?: string[];
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  raw?: string;
};

type OfferAssistResult = {
  title: string;
  type: "stage" | "emploi";
  description: string;
  requirements: string;
  location: string;
  deadline: string;
};

export type RankGrade = "A" | "B" | "C" | "D" | "E";

export function scoreToGrade(score: number): RankGrade {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "E";
}

const FAQ_CONTEXT = `
YasCareer est la plateforme de recrutement de Yas Togo.
- Les candidats s'inscrivent, consultent les offres (stage/emploi), postulent avec CV et lettre.
- Ils suivent le statut : envoyée → en cours d'analyse → entretien programmé → acceptée/rejetée.
- Les entretiens peuvent être présentiels ou distanciels (lien Meet/Zoom fourni par le RH).
- Le RH gère offres, candidatures et entretiens. L'admin gère les comptes utilisateurs.
Réponds uniquement sur le fonctionnement de YasCareer, en français, de façon concise et utile.
`;

function addDaysIso(days: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function inferTypeFromBrief(brief: string, preferred?: string): "stage" | "emploi" {
  if (preferred === "stage" || preferred === "emploi") return preferred;
  return /stage|stagiaire|internship/i.test(brief) ? "stage" : "emploi";
}

function fallbackAssistOffer(brief: string, preferredType?: string): OfferAssistResult {
  const type = inferTypeFromBrief(brief, preferredType);

  let location = "Lomé";
  if (/kara/i.test(brief)) location = "Kara";
  else if (/atakpamé|plateaux/i.test(brief)) location = "Atakpamé (Plateaux)";
  else if (/dapaong|savanes/i.test(brief)) location = "Dapaong (Savanes)";
  else if (/lom[eé]/i.test(brief)) location = "Lomé";

  const deadline = addDaysIso(type === "stage" ? 30 : 21);

  let title =
    brief
      .split(/[.!\n]/)[0]
      ?.trim()
      .replace(
        /^(je (veux|voudrais|souhaite)|on (cherche|a besoin d[e']?)|nous (cherchons|avons besoin d[e']?)|créer?|recruter?|poste de|besoin d[e']?)\s+/i,
        ""
      )
      .replace(/^(un|une|le|la|des)\s+/i, "")
      .slice(0, 90) || "";
  if (!title || title.length < 8) {
    title = type === "stage" ? "Stage — Opportunité Yas Togo" : "Poste à pourvoir — Yas Togo";
  }
  title = title.charAt(0).toUpperCase() + title.slice(1);
  if (type === "stage" && !/^stage/i.test(title)) title = `Stage — ${title}`;
  else if (type === "stage") title = title.replace(/^stage\s*[—\-:]?\s*/i, "Stage — ");

  const skillsPool: string[] = [];
  const skillHints: [RegExp, string[]][] = [
    [/react|front|web|javascript|typescript/i, ["JavaScript", "TypeScript", "React", "Git"]],
    [/flutter|mobile|dart/i, ["Flutter", "Dart", "APIs REST", "Firebase"]],
    [/data|analyst|power\s*bi|sql/i, ["Excel", "Power BI", "SQL", "Analyse de données"]],
    [/marketing|digital|social/i, ["Marketing digital", "Réseaux sociaux", "Content", "Canva"]],
    [/réseau|radio|ran|ftth|fibre/i, ["Réseaux télécoms", "Troubleshooting", "Documentation technique"]],
    [/cyber|soc|sécurité/i, ["Cybersécurité", "SIEM", "Incident response", "Réseaux"]],
    [/rh|recrut|formation/i, ["Recrutement", "Communication", "Pack Office", "Relationnel"]],
    [/finance|compta|comptable/i, ["Comptabilité", "Excel", "Fiscalité", "Reporting"]],
    [/client|call\s*center|conseiller/i, ["Relation client", "Vente", "Orientation résultats", "Soft skills"]],
    [/ux|ui|figma|design/i, ["Figma", "UX research", "UI design", "Prototypage"]],
  ];
  for (const [re, skills] of skillHints) if (re.test(brief)) skillsPool.push(...skills);
  if (!skillsPool.length)
    skillsPool.push("Communication", "Travail en équipe", "Pack Office", "Orientation résultats");
  const requirements = [...new Set(skillsPool)].slice(0, 8).join(", ");

  const roleLabel = type === "stage" ? "un(e) stagiaire" : "un(e) collaborateur(trice)";
  const description = `Yas Togo, 1er réseau internet mobile au Togo et dans l’UEMOA, certifié Top Employer, recrute ${roleLabel}.

À propos du poste
${brief.trim()}

Missions
• Contribuer aux objectifs de l’équipe concernée
• Collaborer avec les métiers Yas (IT, réseau, commercial, RH…)
• Respecter les process et la culture « Let’s grow together »
• Produire des livrables clairs et actionnables

Profil
• Motivation pour le secteur télécoms / digital
• Compétences : ${requirements}
• Bon relationnel et sens du résultat
${type === "stage" ? "• Étudiant(e) ou jeune diplômé(e)" : "• Expérience pertinente sur un poste similaire"}

Ce que nous offrons
• Environnement Top Employer
• Formation et accompagnement
• Opportunité d’impact au Togo
• Lieu : ${location}`;

  return { title, type, description, requirements, location, deadline };
}

// Ollama exposes an OpenAI-compatible API. We reach it through the `openai`
// SDK by pointing baseURL at the Ollama server (default http://localhost:11434/v1).
// No API key is required for a local Ollama, so the SDK is given a dummy one.
function client(): OpenAI | null {
  const baseURL = env.OLLAMA_URL;
  if (!baseURL) return null;
  return new OpenAI({
    baseURL,
    apiKey: env.OLLAMA_API_KEY || "ollama",
  });
}

async function chatJson(system: string, user: string): Promise<string> {
  const ai = client();
  if (!ai) throw new Error("OLLAMA_URL non configurée");
  const completion = await ai.chat.completions.create({
    model: env.OLLAMA_MODEL,
    temperature: 0.2,
    // Ollama honours OpenAI-style JSON mode; it forces valid JSON output.
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  return completion.choices[0]?.message?.content || "{}";
}

async function chatText(system: string, user: string): Promise<string> {
  const ai = client();
  if (!ai) throw new Error("OLLAMA_URL non configurée");
  const completion = await ai.chat.completions.create({
    model: env.OLLAMA_MODEL,
    temperature: 0.3,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  return completion.choices[0]?.message?.content || "";
}

// AI is "configured" as soon as an Ollama endpoint is set. When it isn't, every
// method falls back to the heuristic implementations below.
function isConfigured() {
  return Boolean(env.OLLAMA_URL);
}

function fallbackScore(
  application: Application,
  offer: Offer,
  dossierText?: string,
  rhCriteria?: string
): MatchResult {
  const reqFromOffer = (offer.requirements || "")
    .toLowerCase()
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const reqFromCriteria = (rhCriteria || "")
    .toLowerCase()
    .split(/[,;\n•\-]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2 && s.length < 80)
    .slice(0, 12);
  const req = [...new Set([...reqFromCriteria, ...reqFromOffer])];
  const hay = `${dossierText || ""} ${application.coverLetterText || ""}`.toLowerCase();
  if (!req.length) {
    const hasCv = Boolean(application.cvUrl || (dossierText && dossierText.length > 80));
    const score = hasCv ? 55 : 35;
    return {
      score,
      summary: hasCv
        ? "Analyse basique (IA indisponible) — dossier présent, compétences offre non listées."
        : "Analyse basique (IA indisponible) — dossier insuffisant.",
      strengths: hasCv ? ["Dossier documenté"] : [],
      gaps: hasCv ? ["Compétences offre non spécifiées"] : ["CV / lettre manquants"],
      recommendation: score >= 50 ? "a_envisager" : "ecarter",
    };
  }
  const matched = req.filter((skill) => hay.includes(skill.toLowerCase()));
  const ratio = matched.length / req.length;
  const docBonus = (dossierText?.length || 0) > 200 ? 8 : 0;
  const criteriaBonus = reqFromCriteria.length ? 5 : 0;
  const score = Math.min(98, Math.round(ratio * 75 + 12 + docBonus + criteriaBonus));
  return {
    score,
    summary: `Analyse basique${rhCriteria ? " (avec critères RH)" : ""}. Compétences repérées : ${matched.join(", ") || "aucune"} (${matched.length}/${req.length}).`,
    strengths: matched.slice(0, 5),
    gaps: req.filter((s) => !matched.includes(s)).slice(0, 4),
    recommendation: score >= 75 ? "retenir" : score >= 50 ? "a_envisager" : "ecarter",
  };
}

/**
 * L'IA (en particulier un modèle Ollama local) ne respecte pas toujours
 * strictement le schéma demandé — il arrive qu'elle renvoie un objet
 * structuré (ex. { nom, option, établissement, année_academique }) là où une
 * simple chaîne de texte est attendue. On normalise donc chaque champ dès
 * l'extraction, pour ne jamais stocker en base une donnée qui ne correspond
 * pas au type déclaré (et casserait l'affichage ailleurs dans l'app).
 */
function normalizeTextEntry(entry: unknown): string | null {
  if (typeof entry === "string") {
    const trimmed = entry.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (entry && typeof entry === "object") {
    const o = entry as Record<string, unknown>;
    const parts = [
      o.nom ?? o.titre ?? o.poste ?? o.diplome ?? o.diplôme,
      o.option,
      o.établissement ?? o.etablissement ?? o.entreprise ?? o.ecole ?? o.école,
      o.année_academique ??
        o.annee_academique ??
        o.periode ??
        o.période ??
        o.année ??
        o.annee,
    ].filter((p): p is string => typeof p === "string" && p.trim().length > 0);
    if (parts.length > 0) return parts.join(" — ");
    try {
      return JSON.stringify(o);
    } catch {
      return null;
    }
  }
  return entry == null ? null : String(entry);
}

function normalizeTextArray(value: unknown, max = 12): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(normalizeTextEntry)
    .filter((s): s is string => s != null)
    .slice(0, max);
}

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export const INVALID_CV_MESSAGE =
  "Ce document ne semble pas être un CV valide. Veuillez vérifier le fichier téléversé.";

export class InvalidCvDocumentError extends Error {
  constructor() {
    super(INVALID_CV_MESSAGE);
    this.name = "InvalidCvDocumentError";
  }
}

/**
 * Heuristique légère (aucun appel IA) pour filtrer, avant extraction/scoring,
 * les documents qui ne sont manifestement pas un CV (rapport, facture, page
 * quelconque…). On exige soit 2+ sections typiques d'un CV (expérience,
 * formation, compétences...), soit 1 section + des coordonnées détectables —
 * un seuil volontairement permissif pour ne pas rejeter de vrais CV atypiques.
 */
const CV_SECTION_HINTS: RegExp[] = [
  /exp[ée]rience(s)?\s*(professionnelle|pro)?/i,
  /parcours\s+professionnel/i,
  /formation(s)?/i,
  /dipl[oô]me/i,
  /cursus/i,
  /comp[ée]tence(s)?/i,
  /curriculum\s+vitae/i,
  /profil(\s+professionnel)?/i,
  /coordonn[ée]es/i,
  /langue(s)?\s*(parl[ée]e|maitris[ée]e)?/i,
  /stage(s)?/i,
  /r[ée]f[ée]rence(s)?/i,
  /centres?\s+d.int[ée]r[eê]t/i,
];

function hasContactInfo(text: string): boolean {
  const email = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text);
  const phone = /(?:\+?228[\s.-]?)?(?:\d[\s.-]?){8,12}/.test(text);
  return email || phone;
}

function looksLikeCv(text: string): boolean {
  const clean = (text || "").trim();
  if (clean.length < 120) return false;
  const hits = CV_SECTION_HINTS.filter((re) => re.test(clean)).length;
  return hits >= 2 || (hits >= 1 && hasContactInfo(clean));
}

// Même logique que CV_SECTION_HINTS mais pour une lettre de motivation :
// formules d'appel/de politesse, objet de candidature, tournures typiques —
// des signaux quasi absents d'un CV, d'un rapport ou d'un document quelconque.
const COVER_LETTER_HINTS: RegExp[] = [
  /objet\s*:?\s*candidature/i,
  /madame,?\s*monsieur/i,
  /à\s+l['’]attention\s+de/i,
  /je\s+me\s+permets/i,
  /je\s+vous\s+adresse/i,
  /candidature\s+(au|pour\s+le|à\s+l['’])\s*poste/i,
  /motiv[ée]?\s+(par|pour|à)/i,
  /veuillez\s+agr[ée]er/i,
  /dans\s+l['’]attente/i,
  /cordialement/i,
  /je\s+vous\s+prie/i,
  /lettre\s+de\s+motivation/i,
];

function looksLikeCoverLetter(text: string): boolean {
  const clean = (text || "").trim();
  if (clean.length < 100) return false;
  const hits = COVER_LETTER_HINTS.filter((re) => re.test(clean)).length;
  return hits >= 2;
}

/**
 * Points d'entrée réutilisables pour vérifier un document AVANT de l'envoyer
 * plus loin dans le système (formulaire de candidature) — même heuristique
 * que celle utilisée pendant l'extraction/le scoring IA, exposée ici pour ne
 * pas la dupliquer.
 */
export function assessCvText(text: string): { valid: boolean; message: string } {
  if (looksLikeCv(text)) return { valid: true, message: "" };
  return {
    valid: false,
    message: "Ce fichier ne ressemble pas à un CV valide, veuillez vérifier votre document.",
  };
}

export function assessCoverLetterText(text: string): { valid: boolean; message: string } {
  if (looksLikeCoverLetter(text)) return { valid: true, message: "" };
  return {
    valid: false,
    message:
      "Ce fichier ne ressemble pas à une lettre de motivation valide, veuillez vérifier votre document.",
  };
}

function fallbackExtractCv(text: string): CvExtraction {
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = text.match(/(?:\+?228[\s.-]?)?(?:\d[\s.-]?){8,12}/);
  const firstLines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 8);
  const nameCandidate = firstLines.find(
    (l) =>
      l.length > 3 &&
      l.length < 60 &&
      !l.includes("@") &&
      !/curriculum|vitae|cv|profil|compétences|experience/i.test(l)
  );
  const skills = text
    .split(/[,;\n|•·]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2 && s.length < 40)
    .slice(0, 12);

  return {
    fullName: nameCandidate || null,
    email: emailMatch?.[0] || null,
    phone: phoneMatch?.[0]?.replace(/\s+/g, " ").trim() || null,
    bio: text.slice(0, 400),
    skills: skills.slice(0, 8),
    experiences: [],
    formations: [],
    raw: text.slice(0, 2000),
  };
}

export const AiService = {
  isConfigured,

  async analyzeApplication(
    application: Application,
    offer: Offer,
    dossierText?: string,
    webResearchText?: string,
    rhCriteria?: string | null,
    cvText?: string
  ): Promise<MatchResult> {
    if (cvText && cvText.trim().length > 0 && !looksLikeCv(cvText)) {
      return {
        score: 0,
        summary: INVALID_CV_MESSAGE,
        strengths: [],
        gaps: [
          "Document fourni non reconnu comme un CV (coordonnées, expérience, formation ou compétences absentes ou insuffisantes)",
        ],
        recommendation: "ecarter",
      };
    }

    const dossier =
      dossierText?.trim() ||
      `Lettre: ${application.coverLetterText || "n/a"}\nCV url: ${application.cvUrl || "n/a"}`;
    const webBlock = webResearchText?.trim()
      ? `\n\nRecherche web (infos publiques):\n${webResearchText.trim().slice(0, 4000)}`
      : "";
    const criteria = (rhCriteria ?? offer.aiAnalysisCriteria)?.trim() || "";
    const criteriaBlock = criteria
      ? `\n\nCRITÈRES RH OBLIGATOIRES (à appliquer strictement pour le scoring et la recommandation):\n${criteria.slice(0, 4000)}\nPriorise ces critères RH face aux compétences génériques de l'offre. Si un critère critique n'est pas satisfait, baisse nettement le score et explique-le dans gaps.`
      : "";

    if (!isConfigured()) {
      const fallback = fallbackScore(application, offer, dossier + webBlock, criteria);
      return { ...fallback, webFindings: webResearchText?.trim() || undefined };
    }

    try {
      const raw = await chatJson(
        `Tu es un expert RH Yas Togo. Analyse l'adéquation candidat / offre.
Réponds UNIQUEMENT en JSON avec:
- score (entier 0-100)
- summary (2-3 phrases: points forts et points d'attention)
- strengths (string[], 2 à 5)
- gaps (string[], 0 à 4)
- recommendation ("retenir" | "a_envisager" | "ecarter")
- webFindings (string courte: apport de la recherche web, ou "rien de pertinent")
Base-toi sur le dossier (CV, lettre, profil) ET les infos web publiques si disponibles.
Si des critères RH sont fournis, ils sont prioritaires pour le score et la recommandation.
Ne traite jamais une rumeur web comme un fait certain. Si le dossier est pauvre, baisse le score.`,
        `Offre: ${offer.title}
Type: ${offer.type}
Lieu: ${offer.location || "n/a"}
Description: ${offer.description.slice(0, 4000)}
Compétences requises: ${offer.requirements || "n/a"}${criteriaBlock}

Dossier candidat:
${dossier.slice(0, 12000)}${webBlock}`
      );
      const parsed = JSON.parse(raw) as MatchResult;
      const score = Math.max(0, Math.min(100, Number(parsed.score) || 0));
      const recommendation =
        parsed.recommendation === "retenir" ||
        parsed.recommendation === "a_envisager" ||
        parsed.recommendation === "ecarter"
          ? parsed.recommendation
          : score >= 75
            ? "retenir"
            : score >= 50
              ? "a_envisager"
              : "ecarter";

      return {
        score,
        summary: String(parsed.summary || ""),
        strengths: Array.isArray(parsed.strengths)
          ? parsed.strengths.map(String).slice(0, 5)
          : [],
        gaps: Array.isArray(parsed.gaps) ? parsed.gaps.map(String).slice(0, 4) : [],
        recommendation,
        webFindings: String(parsed.webFindings || webResearchText || "").trim() || undefined,
      };
    } catch (error) {
      console.warn("[ai] analyze failed, using fallback:", error);
      const fallback = fallbackScore(application, offer, dossier + webBlock, criteria);
      return { ...fallback, webFindings: webResearchText?.trim() || undefined };
    }
  },

  async summarizeOfferRanking(input: {
    offerTitle: string;
    ranked: { name: string; grade: string; score: number; summary: string }[];
  }): Promise<string> {
    if (!input.ranked.length) return "Aucune candidature à classer pour cette offre.";

    if (!isConfigured()) {
      const top = input.ranked.filter((r) => r.grade === "A" || r.grade === "B");
      return `Classement automatique terminé pour « ${input.offerTitle} ». ${top.length} profil(s) prioritaire(s) (notes A/B). Le 1er est ${input.ranked[0]?.name} (${input.ranked[0]?.score}/100). Relisez les dossiers avant décision.`;
    }

    try {
      return await chatText(
        "Tu es un RH Yas Togo. Rédige une synthèse courte (4-6 phrases) du classement candidats pour aider à la décision. Français, ton pro, concret.",
        `Offre: ${input.offerTitle}\nClassement (du plus fort au plus faible):\n${input.ranked
          .map((r, i) => `${i + 1}. [${r.grade}] ${r.name} — ${r.score}/100 — ${r.summary}`)
          .join("\n")}`
      );
    } catch (error) {
      console.warn("[ai] ranking summary failed:", error);
      return `Classement établi pour « ${input.offerTitle} ». Tête de liste : ${input.ranked[0]?.name}.`;
    }
  },

  async extractCv(text: string): Promise<CvExtraction> {
    if (text && text.trim().length > 0 && !looksLikeCv(text)) {
      throw new InvalidCvDocumentError();
    }

    const fallback = fallbackExtractCv(text);
    if (!isConfigured()) return fallback;

    try {
      const raw = await chatJson(
        `Tu extrais UNIQUEMENT des faits présents dans le texte du CV pour préremplir un formulaire.
Ne juge pas, n'évalue pas, ne note pas, ne résume pas pour un recruteur.
Si une info n'est pas explicitement dans le texte, mets null ou [].
JSON strict avec:
- fullName (string|null)
- email (string|null)
- phone (string|null)
- bio (string courte factuelle|null)
- skills (string[] de compétences citées)
- experiences (string[])
- formations (string[])`,
        text.slice(0, 12000)
      );
      // `parsed` vient d'un JSON.parse() sur une réponse de modèle IA : on ne
      // lui fait pas confiance tel quel malgré le cast `as CvExtraction` —
      // chaque champ est validé/normalisé avant d'être renvoyé.
      const parsed = JSON.parse(raw) as CvExtraction;
      const skills = normalizeTextArray(parsed.skills, 12);
      const experiences = normalizeTextArray(parsed.experiences, 12);
      const formations = normalizeTextArray(parsed.formations, 12);
      return {
        fullName: normalizeString(parsed.fullName) || fallback.fullName,
        email: normalizeString(parsed.email) || fallback.email,
        phone: normalizeString(parsed.phone) || fallback.phone,
        bio: normalizeString(parsed.bio) || fallback.bio,
        skills: skills.length ? skills : fallback.skills,
        experiences,
        formations,
        raw: text.slice(0, 2000),
      };
    } catch (error) {
      console.warn("[ai] CV extract failed:", error);
      return fallback;
    }
  },

  async assistOffer(brief: string, type?: string): Promise<OfferAssistResult> {
    const preferred = type === "stage" || type === "emploi" ? type : undefined;
    if (!isConfigured()) return fallbackAssistOffer(brief, preferred);

    try {
      const today = new Date().toISOString().slice(0, 10);
      const raw = await chatJson(
        `Tu es l'assistant RH de Yas Togo (télécoms, Top Employer).
À partir d'un brief oral ou écrit (même approximatif), produis une offre complète en français.
Réponds UNIQUEMENT en JSON avec exactement ces clés:
- title (string, titre pro, max 90 caractères)
- type ("stage" | "emploi")
- description (string longue, structurée avec sections: À propos / Missions / Profil / Ce que nous offrons)
- requirements (string: compétences séparées par virgules, 5 à 10 items)
- location (string: ville/région au Togo, ex. "Lomé", "Kara", "Atakpamé (Plateaux)")
- deadline (string date ISO YYYY-MM-DD, typiquement 15 à 45 jours après aujourd'hui ${today})
Si le brief ne précise pas un champ, infère de façon réaliste pour Yas Togo.`,
        `Type suggéré (optionnel): ${preferred || "à déduire"}\nBrief RH:\n${brief}`
      );
      const parsed = JSON.parse(raw) as Partial<OfferAssistResult>;
      const fallback = fallbackAssistOffer(brief, preferred);
      const resolvedType =
        parsed.type === "stage" || parsed.type === "emploi" ? parsed.type : fallback.type;

      let deadline = String(parsed.deadline || fallback.deadline).slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) deadline = fallback.deadline;

      return {
        title: String(parsed.title || fallback.title).slice(0, 200),
        type: resolvedType,
        description: String(parsed.description || fallback.description),
        requirements: String(parsed.requirements || fallback.requirements),
        location: String(parsed.location || fallback.location).slice(0, 120),
        deadline,
      };
    } catch (error) {
      console.warn("[ai] offer assist failed:", error);
      return fallbackAssistOffer(brief, preferred);
    }
  },

  async chatbotReply(message: string, userContext?: string): Promise<string> {
    if (!isConfigured()) return faqFallback(message);
    try {
      return await chatText(
        FAQ_CONTEXT + (userContext ? `\nContexte utilisateur: ${userContext}` : ""),
        message
      );
    } catch (error) {
      console.warn("[ai] chatbot failed:", error);
      return faqFallback(message);
    }
  },
};

function faqFallback(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("postul")) {
    return "Pour postuler : ouvrez une offre publiée, cliquez sur « Postuler », joignez votre CV et une lettre de motivation.";
  }
  if (m.includes("entretien") || m.includes("meet") || m.includes("zoom")) {
    return "Si un entretien est programmé, vous le verrez dans « Mes entretiens » avec la date et le lien visioconférence fourni par le RH.";
  }
  if (m.includes("statut") || m.includes("candidature")) {
    return "Suivez vos candidatures dans l’espace candidat. Les statuts vont de « En attente » jusqu’à « Acceptée » ou « Rejetée ».";
  }
  return "Je peux vous aider sur la candidature, le suivi des dossiers et les entretiens YasCareer. Posez une question concrète !";
}
