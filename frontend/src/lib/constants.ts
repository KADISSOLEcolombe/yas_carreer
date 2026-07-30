import type {
  ApplicationStatus,
  InterviewMode,
  InterviewStatus,
  OfferStatus,
  OfferType,
  UserRole,
} from "@/lib/types";

export const YAS_COLORS = {
  yellow: "#FFD100",
  midnight: "#00377D",
  sky: "#5F99D2",
} as const;

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  envoyee: "Envoyée",
  en_cours_analyse: "En cours d'analyse",
  entretien_programme: "Entretien programmé",
  acceptee: "Acceptée",
  rejetee: "Rejetée",
};

export const APPLICATION_STATUS_ORDER: ApplicationStatus[] = [
  "envoyee",
  "en_cours_analyse",
  "entretien_programme",
  "acceptee",
  "rejetee",
];

export const APPLICATION_STATUS_BADGE_VARIANT: Record<
  ApplicationStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  envoyee: "secondary",
  en_cours_analyse: "outline",
  entretien_programme: "default",
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
};

export const ROLE_DASHBOARD_PATH: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  rh: "/rh/dashboard",
  candidat: "/candidat/dashboard",
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
  // RH
  if (type === "new_application" || type === "guest_application")
    return "/rh/candidatures";
  if (type === "ai_ranking_ready" || type === "ai_analysis_ready")
    return "/rh/candidatures";
  if (type === "offer_published") return "/rh/offres";
  return "/rh/notifications";
}
