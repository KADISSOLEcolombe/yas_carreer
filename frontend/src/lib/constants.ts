import type {
  ApplicationStatus,
  ContractType,
  EmploiStatus,
  InterviewMode,
  InterviewRequestStatus,
  InterviewStatus,
  OfferStatus,
  OfferType,
  SupervisionNoteRecommendation,
  SupervisionNoteType,
  UserRole,
} from "@/lib/types";

export const YAS_COLORS = {
  yellow: "#FFD100",
  midnight: "#00377D",
  sky: "#5F99D2",
} as const;

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  envoyee: "En attente",
  en_cours_analyse: "En cours d'analyse",
  preselectionnee: "Présélectionnée",
  entretien_programme: "Entretien programmé",
  entretien_realise: "Entretien réalisé",
  acceptee: "Acceptée",
  rejetee: "Rejetée",
};

export const APPLICATION_STATUS_ORDER: ApplicationStatus[] = [
  "envoyee",
  "en_cours_analyse",
  "preselectionnee",
  "entretien_programme",
  "entretien_realise",
  "acceptee",
  "rejetee",
];

/**
 * Miroir de `APPLICATION_TRANSITIONS` (yascareer-backend/src/server/domain.ts) —
 * uniquement pour filtrer l'UI (menu déroulant RH). La source de vérité reste
 * la validation serveur ; ne pas s'appuyer sur cette table pour la sécurité.
 */
export const APPLICATION_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  envoyee: ["en_cours_analyse", "rejetee"],
  en_cours_analyse: ["preselectionnee", "rejetee"],
  preselectionnee: ["entretien_programme", "rejetee"],
  entretien_programme: ["entretien_realise", "rejetee"],
  entretien_realise: ["acceptee", "rejetee"],
  acceptee: [],
  rejetee: [],
};

export const APPLICATION_STATUS_BADGE_VARIANT: Record<
  ApplicationStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  envoyee: "secondary",
  en_cours_analyse: "outline",
  preselectionnee: "outline",
  entretien_programme: "default",
  entretien_realise: "default",
  acceptee: "default",
  rejetee: "destructive",
};

export const OFFER_TYPE_LABELS: Record<OfferType, string> = {
  stage: "Stage",
  emploi: "Emploi",
};

export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  brouillon: "Brouillon",
  publiee: "Publiée",
  fermee: "Fermée",
};

export const INTERVIEW_MODE_LABELS: Record<InterviewMode, string> = {
  presentiel: "Présentiel",
  distanciel: "Distanciel",
};

export const INTERVIEW_STATUS_LABELS: Record<InterviewStatus, string> = {
  planifie: "Planifié",
  termine: "Terminé",
  annule: "Annulé",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrateur",
  rh: "Ressources humaines",
  candidat: "Candidat",
  superviseur: "Superviseur",
};

export const ROLE_DASHBOARD_PATH: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  rh: "/rh/dashboard",
  candidat: "/candidat/dashboard",
  superviseur: "/superviseur/dashboard",
};

export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  new_application: "Nouvelle candidature",
  guest_application: "Candidature ouverte",
  application_status: "Statut candidature",
  interview: "Entretien",
  rh_email: "Message RH",
  offer_published: "Offre publiée",
  ai_analysis_ready: "Analyse IA",
  ai_ranking_ready: "Classement IA",
  account_activated: "Compte activé",
  availability_request: "Demande de disponibilité",
  availability_response: "Réponse de disponibilité",
  emploi_assigned: "Nouvelle affectation",
  supervision_note: "Nouveau suivi",
};

export const INTERVIEW_REQUEST_STATUS_LABELS: Record<InterviewRequestStatus, string> = {
  en_attente: "En attente",
  disponible: "Disponible",
  indisponible: "Indisponible",
};

/** Niveau d'étude du candidat — texte libre en base, options suggérées ici pour l'UI. */
export const NIVEAU_ETUDE_OPTIONS = [
  "Bac",
  "Bac+1",
  "Bac+2",
  "Bac+3",
  "Bac+4",
  "Bac+5",
  "Bac+6 et plus",
  "Doctorat",
] as const;

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  stage: "Stage",
  cdd: "CDD",
  cdi: "CDI",
};

export const EMPLOI_STATUS_LABELS: Record<EmploiStatus, string> = {
  actif: "Actif",
  termine: "Terminé",
};

export const SUPERVISION_NOTE_TYPE_LABELS: Record<SupervisionNoteType, string> = {
  rapport: "Rapport de suivi",
  evaluation: "Évaluation",
  observation: "Observation",
};

export const RECOMMENDATION_LABELS: Record<SupervisionNoteRecommendation, string> = {
  favorable: "Favorable",
  a_revoir: "À revoir",
  defavorable: "Défavorable",
};

/** Lien métier selon le type de notification et le rôle. */
export function notificationHref(
  type: string,
  role: UserRole | null | undefined
): string {
  if (role === "candidat") {
    if (type === "interview") return "/candidat/entretiens";
    if (type === "application_status" || type === "rh_email")
      return "/candidat/candidatures";
    if (type === "account_activated") return "/candidat/dashboard";
    return "/candidat/notifications";
  }
  if (role === "admin") {
    if (type === "new_application" || type === "guest_application")
      return "/rh/candidatures";
    if (type.startsWith("ai_")) return "/rh/candidatures";
    if (type === "offer_published") return "/rh/offres";
    return "/admin/notifications";
  }
  if (role === "superviseur") {
    if (type === "availability_request") return "/superviseur/disponibilites";
    if (type === "interview") return "/superviseur/entretiens";
    if (type === "emploi_assigned") return "/superviseur/employes";
    return "/superviseur/notifications";
  }
  // RH
  if (type === "availability_response") return "/rh/entretiens?tab=a_traiter";
  if (type === "new_application" || type === "guest_application")
    return "/rh/candidatures";
  if (type === "ai_ranking_ready" || type === "ai_analysis_ready")
    return "/rh/candidatures";
  if (type === "offer_published") return "/rh/offres";
  return "/rh/notifications";
}
