export type UserRole = "admin" | "rh" | "candidat";

export type OfferType = "stage" | "emploi";
export type OfferStatus = "brouillon" | "publiee" | "fermee";

export type ApplicationStatus =
  | "envoyee"
  | "en_cours_analyse"
  | "entretien_programme"
  | "acceptee"
  | "rejetee";

export type InterviewMode = "presentiel" | "distanciel";
export type InterviewStatus = "planifie" | "termine" | "annule";

export interface User {
  id: number;
  fullName: string | null;
  email: string;
  role: UserRole;
  phone: string | null;
  isActive: boolean;
  mustChangePassword?: boolean;
  initials: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CandidateProfile {
  id: number;
  userId: number;
  bio: string | null;
  skills: string | null;
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

export interface Interview {
  id: number;
  applicationId: number;
  scheduledAt: string;
  meetingLink: string | null;
  mode: InterviewMode;
  notes: string | null;
  status: InterviewStatus;
  createdAt: string;
  updatedAt: string | null;
  application?: Application;
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
  | "account_activated";

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
