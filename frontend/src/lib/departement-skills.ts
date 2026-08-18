/**
 * Compétences suggérées par département, pour préremplir/orienter le choix
 * du RH à la création d'une offre (liste statique volontairement simple —
 * pas de gestion CRUD, ajustable directement ici si besoin). Le RH garde la
 * possibilité d'ajouter n'importe quelle compétence hors de cette liste.
 */
const DEPARTEMENT_SKILLS: Record<string, string[]> = {
  Informatique: [
    "JavaScript",
    "TypeScript",
    "Python",
    "SQL",
    "React",
    "Node.js",
    "PHP",
    "Réseaux",
    "Git",
    "APIs REST",
  ],
  Marketing: [
    "Marketing digital",
    "Réseaux sociaux",
    "Meta Ads",
    "Content",
    "Canva",
    "Analytics",
    "Community management",
    "SEO",
  ],
  Finance: [
    "Comptabilité",
    "Fiscalité",
    "Excel",
    "Budget",
    "Contrôle de gestion",
    "Reporting",
    "SAP",
  ],
  "Ressources Humaines": [
    "Recrutement",
    "Formation",
    "SIRH",
    "Communication RH",
    "Entretiens",
    "Droit du travail",
    "Marque employeur",
  ],
  "Commercial & Ventes": [
    "Vente conseil",
    "Négociation",
    "Relation client",
    "Animation réseau",
    "Distribution",
    "CRM",
    "Prospection",
  ],
  Opérations: [
    "Réseaux mobiles",
    "RAN",
    "FTTH",
    "Fibre optique",
    "Troubleshooting",
    "Monitoring",
    "4G/5G",
  ],
  Juridique: [
    "Droit des affaires",
    "Droit télécoms",
    "Contrats",
    "Compliance",
    "Contentieux",
    "RGPD",
  ],
};

export function getSuggestedSkills(departementNom?: string | null): string[] {
  if (!departementNom) return [];
  return DEPARTEMENT_SKILLS[departementNom] ?? [];
}
