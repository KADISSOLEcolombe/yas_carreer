import Groq from 'groq-sdk'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import type Offer from '#models/offer'
import type Application from '#models/application'

type MatchResult = {
  score: number
  summary: string
  strengths?: string[]
  gaps?: string[]
  recommendation?: 'retenir' | 'a_envisager' | 'ecarter'
  webFindings?: string
}

type CvExtraction = {
  bio?: string
  skills?: string[]
  experiences?: string[]
  formations?: string[]
  fullName?: string
  email?: string
  phone?: string
  raw?: string
}

type OfferAssistResult = {
  title: string
  type: 'stage' | 'emploi'
  description: string
  requirements: string
  location: string
  deadline: string
}

export type RankGrade = 'A' | 'B' | 'C' | 'D' | 'E'

export function scoreToGrade(score: number): RankGrade {
  if (score >= 85) return 'A'
  if (score >= 70) return 'B'
  if (score >= 55) return 'C'
  if (score >= 40) return 'D'
  return 'E'
}

const FAQ_CONTEXT = `
YasCareer est la plateforme de recrutement de Yas Togo.
- Les candidats s'inscrivent, consultent les offres (stage/emploi), postulent avec CV et lettre.
- Ils suivent le statut : envoyée → en cours d'analyse → entretien programmé → acceptée/rejetée.
- Les entretiens peuvent être présentiels ou distanciels (lien Meet/Zoom fourni par le RH).
- Le RH gère offres, candidatures et entretiens. L'admin gère les comptes utilisateurs.
Réponds uniquement sur le fonctionnement de YasCareer, en français, de façon concise et utile.
`

function addDaysIso(days: number): string {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function inferTypeFromBrief(brief: string, preferred?: string): 'stage' | 'emploi' {
  if (preferred === 'stage' || preferred === 'emploi') return preferred
  return /stage|stagiaire|internship/i.test(brief) ? 'stage' : 'emploi'
}

function fallbackAssistOffer(brief: string, preferredType?: string): OfferAssistResult {
  const type = inferTypeFromBrief(brief, preferredType)
  const lower = brief.toLowerCase()

  let location = 'Lomé'
  if (/kara/i.test(brief)) location = 'Kara'
  else if (/atakpamé|plateaux/i.test(brief)) location = 'Atakpamé (Plateaux)'
  else if (/dapaong|savanes/i.test(brief)) location = 'Dapaong (Savanes)'
  else if (/lom[eé]/i.test(brief)) location = 'Lomé'

  const deadlineDays = type === 'stage' ? 30 : 21
  const deadline = addDaysIso(deadlineDays)

  let title = brief
    .split(/[.!\n]/)[0]
    ?.trim()
    .replace(
      /^(je (veux|voudrais|souhaite)|on (cherche|a besoin d[e']?)|nous (cherchons|avons besoin d[e']?)|créer?|recruter?|poste de|besoin d[e']?)\s+/i,
      ''
    )
    .replace(/^(un|une|le|la|des)\s+/i, '')
    .slice(0, 90)
  if (!title || title.length < 8) {
    title = type === 'stage' ? 'Stage — Opportunité Yas Togo' : 'Poste à pourvoir — Yas Togo'
  }
  // Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1)
  if (type === 'stage' && !/^stage/i.test(title)) {
    title = `Stage — ${title}`
  } else if (type === 'stage') {
    title = title.replace(/^stage\s*[—\-:]?\s*/i, 'Stage — ')
  }

  const skillsPool: string[] = []
  const skillHints: [RegExp, string[]][] = [
    [/react|front|web|javascript|typescript/i, ['JavaScript', 'TypeScript', 'React', 'Git']],
    [/flutter|mobile|dart/i, ['Flutter', 'Dart', 'APIs REST', 'Firebase']],
    [/data|analyst|power\s*bi|sql/i, ['Excel', 'Power BI', 'SQL', 'Analyse de données']],
    [/marketing|digital|social/i, ['Marketing digital', 'Réseaux sociaux', 'Content', 'Canva']],
    [/réseau|radio|ran|ftth|fibre/i, ['Réseaux télécoms', 'Troubleshooting', 'Documentation technique']],
    [/cyber|soc|sécurité/i, ['Cybersécurité', 'SIEM', 'Incident response', 'Réseaux']],
    [/rh|recrut|formation/i, ['Recrutement', 'Communication', 'Pack Office', 'Relationnel']],
    [/finance|compta|comptable/i, ['Comptabilité', 'Excel', 'Fiscalité', 'Reporting']],
    [/client|call\s*center|conseiller/i, ['Relation client', 'Vente', 'Orientation résultats', 'Soft skills']],
    [/ux|ui|figma|design/i, ['Figma', 'UX research', 'UI design', 'Prototypage']],
  ]
  for (const [re, skills] of skillHints) {
    if (re.test(brief)) skillsPool.push(...skills)
  }
  if (!skillsPool.length) {
    skillsPool.push('Communication', 'Travail en équipe', 'Pack Office', 'Orientation résultats')
  }
  const requirements = [...new Set(skillsPool)].slice(0, 8).join(', ')

  const roleLabel = type === 'stage' ? 'un(e) stagiaire' : 'un(e) collaborateur(trice)'
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
${type === 'stage' ? '• Étudiant(e) ou jeune diplômé(e)' : '• Expérience pertinente sur un poste similaire'}

Ce que nous offrons
• Environnement Top Employer
• Formation et accompagnement
• Opportunité d’impact au Togo
• Lieu : ${location}`

  return { title, type, description, requirements, location, deadline }
}

export default class AiService {
  private static client(): Groq | null {
    const key = env.get('GROQ_API_KEY')
    if (!key) return null
    return new Groq({ apiKey: key })
  }

  private static async chatJson(system: string, user: string): Promise<string> {
    const groq = this.client()
    if (!groq) {
      throw new Error('GROQ_API_KEY non configurée')
    }

    const completion = await groq.chat.completions.create({
      model: env.get('GROQ_MODEL') || 'llama-3.3-70b-versatile',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    })

    return completion.choices[0]?.message?.content || '{}'
  }

  private static async chatText(system: string, user: string): Promise<string> {
    const groq = this.client()
    if (!groq) {
      throw new Error('GROQ_API_KEY non configurée')
    }

    const completion = await groq.chat.completions.create({
      model: env.get('GROQ_MODEL') || 'llama-3.3-70b-versatile',
      temperature: 0.3,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    })

    return completion.choices[0]?.message?.content || ''
  }

  static isConfigured() {
    return Boolean(env.get('GROQ_API_KEY'))
  }

  static async analyzeApplication(
    application: Application,
    offer: Offer,
    dossierText?: string,
    webResearchText?: string,
    rhCriteria?: string | null
  ): Promise<MatchResult> {
    const dossier =
      dossierText?.trim() ||
      `Lettre: ${application.coverLetterText || 'n/a'}\nCV url: ${application.cvUrl || 'n/a'}`
    const webBlock = webResearchText?.trim()
      ? `\n\nRecherche web (infos publiques):\n${webResearchText.trim().slice(0, 4000)}`
      : ''
    const criteria = (rhCriteria ?? offer.aiAnalysisCriteria)?.trim() || ''
    const criteriaBlock = criteria
      ? `\n\nCRITÈRES RH OBLIGATOIRES (à appliquer strictement pour le scoring et la recommandation):\n${criteria.slice(0, 4000)}\nPriorise ces critères RH face aux compétences génériques de l'offre. Si un critère critique n'est pas satisfait, baisse nettement le score et explique-le dans gaps.`
      : ''

    if (!this.isConfigured()) {
      const fallback = this.fallbackScore(application, offer, dossier + webBlock, criteria)
      return { ...fallback, webFindings: webResearchText?.trim() || undefined }
    }

    try {
      const raw = await this.chatJson(
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
Lieu: ${offer.location || 'n/a'}
Description: ${offer.description.slice(0, 4000)}
Compétences requises: ${offer.requirements || 'n/a'}${criteriaBlock}

Dossier candidat:
${dossier.slice(0, 12000)}${webBlock}`
      )
      const parsed = JSON.parse(raw) as MatchResult
      const score = Math.max(0, Math.min(100, Number(parsed.score) || 0))
      const recommendation =
        parsed.recommendation === 'retenir' ||
        parsed.recommendation === 'a_envisager' ||
        parsed.recommendation === 'ecarter'
          ? parsed.recommendation
          : score >= 75
            ? 'retenir'
            : score >= 50
              ? 'a_envisager'
              : 'ecarter'

      return {
        score,
        summary: String(parsed.summary || ''),
        strengths: Array.isArray(parsed.strengths)
          ? parsed.strengths.map(String).slice(0, 5)
          : [],
        gaps: Array.isArray(parsed.gaps) ? parsed.gaps.map(String).slice(0, 4) : [],
        recommendation,
        webFindings:
          String(parsed.webFindings || webResearchText || '').trim() || undefined,
      }
    } catch (error) {
      logger.warn({ err: error }, 'AI analyze failed, using fallback')
      const fallback = this.fallbackScore(application, offer, dossier + webBlock, criteria)
      return { ...fallback, webFindings: webResearchText?.trim() || undefined }
    }
  }

  private static fallbackScore(
    application: Application,
    offer: Offer,
    dossierText?: string,
    rhCriteria?: string
  ): MatchResult {
    const reqFromOffer = (offer.requirements || '')
      .toLowerCase()
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
    const reqFromCriteria = (rhCriteria || '')
      .toLowerCase()
      .split(/[,;\n•\-]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 2 && s.length < 80)
      .slice(0, 12)
    const req = [...new Set([...reqFromCriteria, ...reqFromOffer])]
    const hay = `${dossierText || ''} ${application.coverLetterText || ''}`.toLowerCase()
    if (!req.length) {
      const hasCv = Boolean(application.cvUrl || (dossierText && dossierText.length > 80))
      const score = hasCv ? 55 : 35
      return {
        score,
        summary: hasCv
          ? 'Analyse basique (IA indisponible) — dossier présent, compétences offre non listées.'
          : 'Analyse basique (IA indisponible) — dossier insuffisant.',
        strengths: hasCv ? ['Dossier documenté'] : [],
        gaps: hasCv ? ['Compétences offre non spécifiées'] : ['CV / lettre manquants'],
        recommendation: score >= 50 ? 'a_envisager' : 'ecarter',
      }
    }
    const matched = req.filter((skill) => hay.includes(skill.toLowerCase()))
    const ratio = matched.length / req.length
    const docBonus = (dossierText?.length || 0) > 200 ? 8 : 0
    const criteriaBonus = reqFromCriteria.length ? 5 : 0
    const score = Math.min(98, Math.round(ratio * 75 + 12 + docBonus + criteriaBonus))
    return {
      score,
      summary: `Analyse basique${rhCriteria ? ' (avec critères RH)' : ''}. Compétences repérées : ${matched.join(', ') || 'aucune'} (${matched.length}/${req.length}).`,
      strengths: matched.slice(0, 5),
      gaps: req.filter((s) => !matched.includes(s)).slice(0, 4),
      recommendation: score >= 75 ? 'retenir' : score >= 50 ? 'a_envisager' : 'ecarter',
    }
  }

  static async summarizeOfferRanking(input: {
    offerTitle: string
    ranked: { name: string; grade: string; score: number; summary: string }[]
  }): Promise<string> {
    if (!input.ranked.length) {
      return 'Aucune candidature à classer pour cette offre.'
    }

    if (!this.isConfigured()) {
      const top = input.ranked.filter((r) => r.grade === 'A' || r.grade === 'B')
      return `Classement automatique terminé pour « ${input.offerTitle} ». ${top.length} profil(s) prioritaire(s) (notes A/B). Le 1er est ${input.ranked[0]?.name} (${input.ranked[0]?.score}/100). Relisez les dossiers avant décision.`
    }

    try {
      return await this.chatText(
        'Tu es un RH Yas Togo. Rédige une synthèse courte (4-6 phrases) du classement candidats pour aider à la décision. Français, ton pro, concret.',
        `Offre: ${input.offerTitle}\nClassement (du plus fort au plus faible):\n${input.ranked
          .map(
            (r, i) =>
              `${i + 1}. [${r.grade}] ${r.name} — ${r.score}/100 — ${r.summary}`
          )
          .join('\n')}`
      )
    } catch (error) {
      logger.warn({ err: error }, 'Ranking summary failed')
      return `Classement établi pour « ${input.offerTitle} ». Tête de liste : ${input.ranked[0]?.name}.`
    }
  }

  static async extractCv(text: string): Promise<CvExtraction> {
    const fallback = this.fallbackExtractCv(text)
    if (!this.isConfigured()) {
      return fallback
    }

    try {
      const raw = await this.chatJson(
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
      )
      const parsed = JSON.parse(raw) as CvExtraction
      return {
        fullName: parsed.fullName || fallback.fullName,
        email: parsed.email || fallback.email,
        phone: parsed.phone || fallback.phone,
        bio: parsed.bio || fallback.bio,
        skills: Array.isArray(parsed.skills) && parsed.skills.length ? parsed.skills : fallback.skills,
        experiences: Array.isArray(parsed.experiences) ? parsed.experiences : [],
        formations: Array.isArray(parsed.formations) ? parsed.formations : [],
        raw: text.slice(0, 2000),
      }
    } catch (error) {
      logger.warn({ err: error }, 'CV extract AI failed')
      return fallback
    }
  }

  private static fallbackExtractCv(text: string): CvExtraction {
    const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
    const phoneMatch = text.match(/(?:\+?228[\s.-]?)?(?:\d[\s.-]?){8,12}/)
    const firstLines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 8)
    const nameCandidate = firstLines.find(
      (l) =>
        l.length > 3 &&
        l.length < 60 &&
        !l.includes('@') &&
        !/curriculum|vitae|cv|profil|compétences|experience/i.test(l)
    )
    const skills = text
      .split(/[,;\n|•·]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 2 && s.length < 40)
      .slice(0, 12)

    return {
      fullName: nameCandidate || undefined,
      email: emailMatch?.[0],
      phone: phoneMatch?.[0]?.replace(/\s+/g, ' ').trim(),
      bio: text.slice(0, 400),
      skills: skills.slice(0, 8),
      experiences: [],
      formations: [],
      raw: text.slice(0, 2000),
    }
  }

  static async assistOffer(brief: string, type?: string): Promise<OfferAssistResult> {
    const preferred = type === 'stage' || type === 'emploi' ? type : undefined

    if (!this.isConfigured()) {
      return fallbackAssistOffer(brief, preferred)
    }

    try {
      const today = new Date().toISOString().slice(0, 10)
      const raw = await this.chatJson(
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
        `Type suggéré (optionnel): ${preferred || 'à déduire'}\nBrief RH:\n${brief}`
      )
      const parsed = JSON.parse(raw) as Partial<OfferAssistResult>
      const fallback = fallbackAssistOffer(brief, preferred)
      const resolvedType =
        parsed.type === 'stage' || parsed.type === 'emploi'
          ? parsed.type
          : fallback.type

      let deadline = String(parsed.deadline || fallback.deadline).slice(0, 10)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
        deadline = fallback.deadline
      }

      return {
        title: String(parsed.title || fallback.title).slice(0, 200),
        type: resolvedType,
        description: String(parsed.description || fallback.description),
        requirements: String(parsed.requirements || fallback.requirements),
        location: String(parsed.location || fallback.location).slice(0, 120),
        deadline,
      }
    } catch (error) {
      logger.warn({ err: error }, 'AI offer assist failed, using fallback')
      return fallbackAssistOffer(brief, preferred)
    }
  }

  static async chatbotReply(message: string, userContext?: string): Promise<string> {
    if (!this.isConfigured()) {
      return this.faqFallback(message)
    }

    try {
      return await this.chatText(
        FAQ_CONTEXT + (userContext ? `\nContexte utilisateur: ${userContext}` : ''),
        message
      )
    } catch (error) {
      logger.warn({ err: error }, 'Chatbot AI failed')
      return this.faqFallback(message)
    }
  }

  private static faqFallback(message: string): string {
    const m = message.toLowerCase()
    if (m.includes('postul')) {
      return 'Pour postuler : ouvrez une offre publiée, cliquez sur « Postuler », joignez votre CV et une lettre de motivation.'
    }
    if (m.includes('entretien') || m.includes('meet') || m.includes('zoom')) {
      return 'Si un entretien est programmé, vous le verrez dans « Mes entretiens » avec la date et le lien visioconférence fourni par le RH.'
    }
    if (m.includes('statut') || m.includes('candidature')) {
      return 'Suivez vos candidatures dans l’espace candidat. Les statuts vont de « Envoyée » jusqu’à « Acceptée » ou « Rejetée ».'
    }
    return 'Je peux vous aider sur la candidature, le suivi des dossiers et les entretiens YasCareer. Posez une question concrète !'
  }
}
