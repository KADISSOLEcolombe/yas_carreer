export type UserRole = 'admin' | 'rh' | 'candidat'

export type OfferType = 'stage' | 'emploi'
export type OfferStatus = 'brouillon' | 'publiee' | 'fermee'

export type ApplicationStatus =
  | 'envoyee'
  | 'en_cours_analyse'
  | 'entretien_programme'
  | 'acceptee'
  | 'rejetee'

export type InterviewMode = 'presentiel' | 'distanciel'
export type InterviewStatus = 'planifie' | 'termine' | 'annule'

export const APPLICATION_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  envoyee: ['en_cours_analyse', 'entretien_programme', 'acceptee', 'rejetee'],
  en_cours_analyse: ['entretien_programme', 'acceptee', 'rejetee', 'envoyee'],
  entretien_programme: ['acceptee', 'rejetee', 'en_cours_analyse'],
  acceptee: [],
  rejetee: [],
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  envoyee: 'Envoyée',
  en_cours_analyse: 'En cours d’analyse',
  entretien_programme: 'Entretien programmé',
  acceptee: 'Acceptée',
  rejetee: 'Rejetée',
}

export function canTransitionStatus(
  from: ApplicationStatus,
  to: ApplicationStatus,
  force = false
): boolean {
  if (from === to) return false
  if (force) return true
  return APPLICATION_TRANSITIONS[from].includes(to)
}
