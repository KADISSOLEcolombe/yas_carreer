export type UserRole = "admin" | "rh" | "candidat" | "superviseur";

export type OfferType = "stage" | "emploi";
export type OfferStatus = "brouillon" | "publiee" | "fermee";

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

export interface User {
  id: number;
  fullName: string | null;
  email: string;
  role: UserRole;
  phone: string | null;
  isActive: boolean;
  mustChangePassword?: boolean;
  initials: string;
  departementId?: number | null;
  departement?: Departement | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CandidateProfile {
  id: number;
  userId: number;
  bio: string | null;
  skills: string | null;
  anneesEtude: string | null;
  ville: string | null;
  quartier: string | null;
  cvUrl: string | null;
  aiExtractedData: {
    bio?: string;
    skills?: string[];
    experiences?: string[];
    formations?: string[];
    raw?: string;
  } | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface Departement {
  id: number;
  nom: string;
  description: string | null;
}

export interface OfferDocumentRequirement {
  nom: string;
  obligatoire: boolean;
  description?: string | null;
}

export interface Offer {
  id: number;
  title: string;
  type: OfferType;
  description: string;
  requirements: string | null;
  deadline: string | null;
  location: string | null;
  status: OfferStatus;
  aiAnalysisCriteria?: string | null;
  documentsRequis: OfferDocumentRequirement[];
  departementId: number | null;
  departement?: Departement | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string | null;
}

export type AiRecommendation = "retenir" | "a_envisager" | "ecarter";
export type AiRankGrade = "A" | "B" | "C" | "D" | "E";

export interface Application {
  id: number;
  offerId: number;
  userId: number;
  status: ApplicationStatus;
  cvUrl: string | null;
  coverLetterUrl: string | null;
  coverLetterText: string | null;
  documentsUrls: Record<string, string> | null;
  aiMatchScore: number | null;
  aiSummary: string | null;
  aiAnalyzedAt: string | null;
  aiAnalysisData?: {
    grade?: AiRankGrade | string;
    strengths?: string[];
    gaps?: string[];
    recommendation?: AiRecommendation;
    criteriaUsed?: string | null;
    documents?: { label: string; ok: boolean; chars: number; images: number }[];
    webResearch?: {
      provider: string;
      summary: string;
      sources: { title: string; url: string; snippet: string }[];
    } | null;
  } | null;
  appliedAt: string;
  createdAt: string;
  updatedAt: string | null;
  offer?: Offer;
  user?: User;
  interview?: Interview | null;
}

export interface ApplicationStatusHistoryEntry {
  id: number;
  applicationId: number;
  status: ApplicationStatus;
  note: string | null;
  changedBy: number | null;
  changedAt: string;
  changer?: User | null;
}

export interface CandidateDocument {
  id: number;
  userId: number;
  label: string;
  url: string;
  createdAt: string;
}

export interface ApplicationNote {
  id: number;
  applicationId: number;
  authorId: number;
  content: string;
  createdAt: string;
  updatedAt: string | null;
  author?: User;
}

export interface ApplicationDetail extends Application {
  profile: CandidateProfile | null;
  statusHistory: ApplicationStatusHistoryEntry[];
  notes: ApplicationNote[];
}

/** Vue restreinte du même dossier candidature, pour un superviseur assigné à
 * l'entretien — pas d'historique de statut, pas de notes RH internes, pas
 * d'analyse IA (déjà absents de la réponse serveur pour ce rôle). */
export interface ApplicationSupervisorView extends Application {
  profile: CandidateProfile | null;
}

export interface Interview {
  id: number;
  applicationId: number;
  supervisorId: number | null;
  scheduledAt: string;
  durationMinutes: number;
  location: string | null;
  meetingLink: string | null;
  mode: InterviewMode;
  notes: string | null;
  status: InterviewStatus;
  createdAt: string;
  updatedAt: string | null;
  application?: Application;
  supervisor?: User | null;
}

export interface AvailableSlot {
  date: string;
  start: string;
  end: string;
}

export interface InterviewRequest {
  id: number;
  /** null = demande générique (non liée à une candidature). */
  applicationId: number | null;
  supervisorId: number;
  requestedBy: number;
  status: InterviewRequestStatus;
  /** Message professionnel rédigé par le RH à la création (demande générique) — consultable par le superviseur une fois connecté. */
  message: string | null;
  availabilityNote: string | null;
  /** Créneaux proposés par le RH avant réponse, puis créneaux confirmés par le superviseur après. */
  availableSlots: AvailableSlot[] | null;
  respondedAt: string | null;
  /** Renseigné une fois que le RH a fini de traiter la réponse (ex. après programmation). */
  handledAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  application?: Application | null;
  supervisor?: User;
  requester?: User;
}

export interface Emploi {
  id: number;
  applicationId: number;
  userId: number;
  supervisorId: number;
  department: string | null;
  contractType: ContractType;
  startDate: string;
  endDate: string | null;
  status: EmploiStatus;
  createdAt: string;
  updatedAt: string | null;
  application?: Application;
  user?: User;
  supervisor?: User;
  supervisionNotes?: SupervisionNote[];
}

/** Dossier complet d'un collaborateur (GET /emplois/:id) — candidature avec
 * historique de statut + entretien, profil candidat inclus. */
export interface EmploiDetail extends Emploi {
  application?: Application & { statusHistory: ApplicationStatusHistoryEntry[] };
  user?: User & { profile: CandidateProfile | null };
}

export type SupervisionNoteRecommendation = "favorable" | "a_revoir" | "defavorable";

export interface SupervisionNote {
  id: number;
  /** L'un des deux est renseigné : emploiId (suivi collaborateur) ou applicationId (évaluation d'entretien pré-embauche). */
  emploiId: number | null;
  applicationId: number | null;
  authorId: number;
  type: SupervisionNoteType;
  title: string | null;
  content: string;
  rating: number | null;
  recommendation: SupervisionNoteRecommendation | null;
  /** Chemin du PDF récapitulatif, généré à l'envoi (suivis et évaluations d'entretien). */
  fichierRapport: string | null;
  createdAt: string;
  updatedAt: string | null;
  author?: User;
  application?: Application;
  emploi?: Emploi;
}

export interface OfferAiRankItem {
  rank: number;
  grade: AiRankGrade;
  applicationId: number;
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  recommendation: AiRecommendation;
  documents: { label: string; ok: boolean; chars: number; images: number }[];
  webResearch?: {
    provider: string;
    summary: string;
    sources: { title: string; url: string; snippet: string }[];
  } | null;
  application: Application;
}

export interface OfferAiRanking {
  offerId: number;
  offerTitle: string;
  overview: string;
  recommendedCount: number;
  webSearch?: boolean;
  fromCache?: boolean;
  analyzedNow?: number;
  ranked: OfferAiRankItem[];
}

export type NotificationType =
  | "new_application"
  | "guest_application"
  | "application_status"
  | "interview"
  | "rh_email"
  | "offer_published"
  | "ai_analysis_ready"
  | "ai_ranking_ready"
  | "account_activated"
  | "availability_request"
  | "availability_response"
  | "emploi_assigned";

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType | string;
  content: string;
  readAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface AdminDashboard {
  usersTotal: number;
  rhCount: number;
  offersTotal: number;
  applicationsTotal: number;
  interviewsUpcoming: number;
  applicationsByStatus: { status: ApplicationStatus; total: number }[];
}

export interface RhDashboard {
  offersTotal: number;
  offersPublished: number;
  applicationsTotal: number;
  interviewsUpcoming: number;
  applicationsByStatus: { status: ApplicationStatus; total: number }[];
}

export interface CandidateDashboard {
  applicationsTotal: number;
  applicationsByStatus: Record<string, number>;
  interviewsUpcoming: number;
}
