export type UserRole = "admin" | "rh" | "candidat" | "superviseur";

export type OfferType = "stage" | "emploi";
export type OfferStatus = "brouillon" | "publiee" | "fermee";

export type OfferDocumentRequirement = {
  nom: string;
  obligatoire: boolean;
  description?: string;
};

export type ApplicationStatus =
  | "envoyee"
  | "en_cours_analyse"
  | "preselectionnee"
  | "entretien_programme"
  | "entretien_realise"
  | "acceptee"
  | "rejetee";

export type InterviewMode = "presentiel" | "distanciel";
export type InterviewStatus = "planifie" | "termine" | "annule";

export type InterviewRequestStatus = "en_attente" | "disponible" | "indisponible";
export type ContractType = "stage" | "cdd" | "cdi";
export type EmploiStatus = "actif" | "termine";
export type SupervisionNoteType = "rapport" | "evaluation" | "observation";

/**
 * Strict linear pipeline — each status has exactly one legitimate forward
 * step, plus "rejetee" as the only early-exit from any active stage. This
 * guarantees "acceptee" is never reachable without having gone through
 * "entretien_programme" then "entretien_realise" first. Automatic transitions
 * triggered by a real action (scheduling an interview, recording an outcome,
 * finalizing a selection) still use `force: true` deliberately — this table
 * only constrains manual, arbitrary status changes from the RH dropdown.
 */
export const APPLICATION_TRANSITIONS: Record<
  ApplicationStatus,
  ApplicationStatus[]
> = {
  envoyee: ["en_cours_analyse", "rejetee"],
  en_cours_analyse: ["preselectionnee", "rejetee"],
  preselectionnee: ["entretien_programme", "rejetee"],
  entretien_programme: ["entretien_realise", "rejetee"],
  entretien_realise: ["acceptee", "rejetee"],
  acceptee: [],
  rejetee: [],
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  envoyee: "En attente",
  en_cours_analyse: "En cours d’analyse",
  preselectionnee: "Présélectionnée",
  entretien_programme: "Entretien programmé",
  entretien_realise: "Entretien réalisé",
  acceptee: "Acceptée",
  rejetee: "Rejetée",
};

export function canTransitionStatus(
  from: ApplicationStatus,
  to: ApplicationStatus,
  force = false
): boolean {
  if (from === to) return false;
  if (force) return true;
  return APPLICATION_TRANSITIONS[from].includes(to);
}

/**
 * "Clôturée" est un état dérivé de `deadline`, jamais stocké : le RH garde le
 * contrôle exclusif du champ `status` (peut prolonger la deadline pour
 * rouvrir les candidatures sans aucune action de rattrapage). Comparaison
 * faite en jours calendaires UTC pour que la candidature reste possible
 * jusqu'à la fin du jour de la deadline, quelle que soit l'heure locale.
 */
export function isOfferExpired(
  deadline: Date | string | null | undefined,
  now: Date = new Date()
): boolean {
  if (!deadline) return false;
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) return false;
  const deadlineDay = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return deadlineDay < today;
}
