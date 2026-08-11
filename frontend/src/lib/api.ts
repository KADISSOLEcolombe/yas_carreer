import { getStoredToken, useAuthStore } from "@/lib/auth-store";
import type {
  AdminDashboard,
  Application,
  ApplicationStatus,
  CandidateDashboard,
  CandidateProfile,
  ContractType,
  Emploi,
  Interview,
  InterviewMode,
  InterviewRequest,
  InterviewStatus,
  Notification,
  Offer,
  OfferAiRanking,
  OfferStatus,
  OfferType,
  RhDashboard,
  SupervisionNote,
  SupervisionNoteType,
  User,
  UserRole,
} from "@/lib/types";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api";

export class ApiError extends Error {
  status: number;
  errors?: unknown;

  constructor(message: string, status: number, errors?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  json?: unknown;
  form?: FormData;
  auth?: boolean;
};

// Every successful YasCareer API response wraps the payload as { data: ... },
// except a handful of message-only endpoints (logout, etc).
function unwrap<T>(body: unknown): T {
  if (body && typeof body === "object" && "data" in (body as Record<string, unknown>)) {
    return (body as { data: T }).data;
  }
  return body as T;
}

function extractErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    if (typeof record.message === "string") return record.message;
    if (Array.isArray(record.errors) && record.errors.length > 0) {
      const first = record.errors[0] as Record<string, unknown>;
      if (typeof first.message === "string") return first.message;
    }
  }
  return fallback;
}

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", json, form, auth = true } = options;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (auth) {
    const token = getStoredToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let body: BodyInit | undefined;
  if (form) {
    body = form;
  } else if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { method, headers, body });
  } catch {
    throw new ApiError(
      "Impossible de contacter le serveur. Vérifiez votre connexion.",
      0
    );
  }

  let parsed: unknown = null;
  const text = await response.text();
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }
  }

  if (!response.ok) {
    if (response.status === 401 && auth) {
      useAuthStore.getState().logout();
    }
    throw new ApiError(
      extractErrorMessage(parsed, "Une erreur est survenue"),
      response.status,
      parsed && typeof parsed === "object"
        ? (parsed as Record<string, unknown>).errors
        : undefined
    );
  }

  return unwrap<T>(parsed);
}

// ---------- Auth ----------

export interface AuthPayload {
  user: User;
  token: string;
  mustChangePassword?: boolean;
  message?: string;
}

export const authApi = {
  login: (payload: { email: string; password: string }) =>
    apiRequest<AuthPayload>("/auth/login", { method: "POST", json: payload, auth: false }),

  register: (payload: {
    fullName: string;
    email: string;
    password: string;
    passwordConfirmation: string;
    phone?: string;
  }) =>
    apiRequest<AuthPayload>("/auth/register", {
      method: "POST",
      json: payload,
      auth: false,
    }),

  activateAccount: (payload: {
    token: string;
    password: string;
    passwordConfirmation: string;
  }) =>
    apiRequest<AuthPayload>("/auth/activate-account", {
      method: "POST",
      json: payload,
      auth: false,
    }),

  changePassword: (payload: {
    currentPassword?: string;
    password: string;
    passwordConfirmation: string;
  }) =>
    apiRequest<{ user: User; message?: string }>("/auth/change-password", {
      method: "POST",
      json: payload,
    }),

  logout: () => apiRequest<{ message: string }>("/auth/logout", { method: "POST" }),

  me: () => apiRequest<{ user: User; profile: CandidateProfile | null }>("/auth/me"),

  updateProfile: (payload: {
    fullName?: string;
    phone?: string | null;
    bio?: string | null;
    skills?: string | null;
  }) =>
    apiRequest<{ user: User; profile: CandidateProfile; updatedAt: string }>(
      "/auth/profile",
      { method: "PATCH", json: payload }
    ),
};

// ---------- Users (admin) ----------

export const usersApi = {
  list: (role?: UserRole) =>
    apiRequest<User[]>(`/users${role ? `?role=${role}` : ""}`),

  create: (payload: {
    fullName: string;
    email: string;
    role: "admin" | "rh" | "superviseur";
    phone?: string;
    password?: string;
  }) =>
    apiRequest<{ user: User; message?: string }>("/users", {
      method: "POST",
      json: payload,
    }),

  updateRole: (id: number, role: UserRole) =>
    apiRequest<{ user: User }>(`/users/${id}/role`, { method: "PATCH", json: { role } }),

  updateStatus: (id: number, isActive: boolean) =>
    apiRequest<{ user: User }>(`/users/${id}/status`, {
      method: "PATCH",
      json: { isActive },
    }),
};

// ---------- Offers ----------

export interface OfferFilters {
  type?: OfferType;
  location?: string;
  q?: string;
  status?: OfferStatus;
}

function buildQuery(params: object) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(
    params as Record<string, string | number | undefined>
  )) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const offersApi = {
  list: (filters: OfferFilters = {}) =>
    apiRequest<Offer[]>(`/offers${buildQuery(filters)}`, { auth: true }),

  get: (id: number | string) => apiRequest<Offer>(`/offers/${id}`, { auth: true }),

  create: (payload: {
    title: string;
    type: OfferType;
    description: string;
    requirements?: string;
    deadline?: string;
    location?: string;
    status?: OfferStatus;
  }) => apiRequest<Offer>("/offers", { method: "POST", json: payload }),

  update: (
    id: number,
    payload: {
      title: string;
      type: OfferType;
      description: string;
      requirements?: string;
      deadline?: string;
      location?: string;
      status?: OfferStatus;
    }
  ) => apiRequest<Offer>(`/offers/${id}`, { method: "PUT", json: payload }),

  remove: (id: number) =>
    apiRequest<{ message: string }>(`/offers/${id}`, { method: "DELETE" }),

  aiAssist: (payload: { brief: string; type?: OfferType }) =>
    apiRequest<{
      title: string;
      type: OfferType;
      description: string;
      requirements: string;
      location: string;
      deadline: string;
    }>("/offers/ai-assist", { method: "POST", json: payload }),

  updateAiCriteria: (id: number, aiAnalysisCriteria: string | null) =>
    apiRequest<Offer>(`/offers/${id}/ai-criteria`, {
      method: "PATCH",
      json: { aiAnalysisCriteria },
    }),

  finalizeSelection: (id: number, retainedApplicationIds: number[]) =>
    apiRequest<{
      offerId: number;
      acceptedCount: number;
      rejectedCount: number;
      accepted: number[];
      rejected: number[];
      failed: { id: number; reason: string }[];
      message: string;
    }>(`/offers/${id}/finalize-selection`, {
      method: "POST",
      json: { retainedApplicationIds },
    }),
};

// ---------- Applications ----------

export const applicationsApi = {
  create: (payload: {
    offerId: number;
    coverLetterText?: string;
    cv?: File | null;
    coverLetter?: File | null;
  }) => {
    const form = new FormData();
    form.set("offerId", String(payload.offerId));
    if (payload.coverLetterText) form.set("coverLetterText", payload.coverLetterText);
    if (payload.cv) form.set("cv", payload.cv);
    if (payload.coverLetter) form.set("coverLetter", payload.coverLetter);
    return apiRequest<Application>("/applications", { method: "POST", form });
  },

  me: () => apiRequest<Application[]>("/applications/me"),

  list: (filters: { offerId?: number; status?: ApplicationStatus } = {}) =>
    apiRequest<Application[]>(
      `/applications${buildQuery({
        offerId: filters.offerId ? String(filters.offerId) : undefined,
        status: filters.status,
      })}`
    ),

  updateStatus: (id: number, status: ApplicationStatus, force = false) =>
    apiRequest<Application>(`/applications/${id}/status`, {
      method: "PATCH",
      json: { status, force },
    }),

  notifySelected: (applicationIds: number[], message?: string) =>
    apiRequest<{
      sentCount: number;
      failedCount: number;
      sent: { id: number; email: string }[];
      failed: { id: number; reason: string }[];
      message: string;
    }>("/applications/notify-selected", {
      method: "POST",
      json: { applicationIds, message: message || undefined },
    }),

  aiAnalyze: (
    id: number,
    options?: { force?: boolean; criteria?: string }
  ) =>
    apiRequest<Application>(
      `/applications/${id}/ai-analyze${buildQuery({
        force: options?.force ? "true" : undefined,
      })}`,
      {
        method: "POST",
        json:
          options?.criteria !== undefined
            ? { criteria: options.criteria }
            : undefined,
      }
    ),

  aiRankOffer: (
    offerId: number,
    options?: { webSearch?: boolean; force?: boolean; criteria?: string }
  ) =>
    apiRequest<OfferAiRanking>(
      `/offers/${offerId}/ai-rank${buildQuery({
        webSearch:
          options?.webSearch === false
            ? "false"
            : options?.webSearch
              ? "true"
              : undefined,
        force: options?.force ? "true" : undefined,
      })}`,
      {
        method: "POST",
        json:
          options?.criteria !== undefined
            ? { criteria: options.criteria }
            : undefined,
      }
    ),

  extractCv: (cv: File) => {
    const form = new FormData();
    form.set("cv", cv);
    return apiRequest<CandidateProfile>("/candidate-profiles/ai-extract-cv", {
      method: "POST",
      form,
    });
  },

};

// ---------- Interviews ----------

export const interviewsApi = {
  create: (payload: {
    applicationId: number;
    supervisorId?: number;
    scheduledAt: string;
    durationMinutes: number;
    mode: InterviewMode;
    location?: string;
    meetingLink?: string;
    notes?: string;
  }) => apiRequest<Interview>("/interviews", { method: "POST", json: payload }),

  me: () => apiRequest<Interview[]>("/interviews/me"),

  list: () => apiRequest<Interview[]>("/interviews"),

  recordOutcome: (id: number, payload: { status: InterviewStatus; notes?: string | null }) =>
    apiRequest<Interview>(`/interviews/${id}`, { method: "PATCH", json: payload }),
};

// ---------- Interview requests (disponibilité superviseur) ----------

export const interviewRequestsApi = {
  create: (payload: { applicationId: number; supervisorId: number }) =>
    apiRequest<InterviewRequest>("/interview-requests", { method: "POST", json: payload }),

  list: (applicationId?: number) =>
    apiRequest<InterviewRequest[]>(
      `/interview-requests${buildQuery({ applicationId })}`
    ),

  me: () => apiRequest<InterviewRequest[]>("/interview-requests/me"),

  respond: (
    id: number,
    payload: { status: "disponible" | "indisponible"; availabilityNote?: string }
  ) =>
    apiRequest<InterviewRequest>(`/interview-requests/${id}`, {
      method: "PATCH",
      json: payload,
    }),
};

// ---------- Emplois (affectations post-recrutement) ----------

export const emploisApi = {
  create: (payload: {
    applicationId: number;
    supervisorId: number;
    department?: string;
    contractType: ContractType;
    startDate: string;
    endDate?: string;
  }) => apiRequest<Emploi>("/emplois", { method: "POST", json: payload }),

  list: () => apiRequest<Emploi[]>("/emplois"),

  me: () => apiRequest<Emploi[]>("/emplois/me"),
};

// ---------- Supervision notes (rapports / évaluations / observations) ----------

export const supervisionNotesApi = {
  list: (emploiId: number) =>
    apiRequest<SupervisionNote[]>(`/supervision-notes${buildQuery({ emploiId })}`),

  create: (payload: {
    emploiId: number;
    type: SupervisionNoteType;
    title?: string;
    content: string;
    rating?: number;
  }) => apiRequest<SupervisionNote>("/supervision-notes", { method: "POST", json: payload }),

  update: (
    id: number,
    payload: Partial<{
      type: SupervisionNoteType;
      title: string;
      content: string;
      rating: number;
    }>
  ) =>
    apiRequest<SupervisionNote>(`/supervision-notes/${id}`, {
      method: "PATCH",
      json: payload,
    }),
};

// ---------- Notifications ----------

export const notificationsApi = {
  me: () => apiRequest<Notification[]>("/notifications/me"),

  unreadCount: () =>
    apiRequest<{ count: number }>("/notifications/unread-count"),

  markRead: (id: number) =>
    apiRequest<Notification>(`/notifications/${id}/read`, { method: "PATCH" }),

  markAllRead: () =>
    apiRequest<{ message: string }>("/notifications/read-all", {
      method: "PATCH",
    }),
};

// ---------- Activity logs (admin) ----------

export interface ActivityLogEntry {
  id: number;
  userId: number;
  action: string;
  category: string;
  summary: string;
  resourceType: string | null;
  resourceId: number | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: User | null;
}

export interface ActivitySummaryRow {
  user: {
    id: number;
    fullName: string | null;
    email: string;
    role: UserRole;
  };
  totalActions: number;
  lastActionAt: string | null;
  lastSummary: string | null;
}

export const activityLogsApi = {
  list: (filters: {
    userId?: number;
    category?: string;
    action?: string;
    q?: string;
    limit?: number;
  } = {}) =>
    apiRequest<ActivityLogEntry[]>(
      `/activity-logs${buildQuery({
        userId: filters.userId ? String(filters.userId) : undefined,
        category: filters.category,
        action: filters.action,
        q: filters.q,
        limit: filters.limit ? String(filters.limit) : undefined,
      })}`
    ),

  summary: () => apiRequest<ActivitySummaryRow[]>("/activity-logs/summary"),

  track: (payload: {
    action: string;
    summary: string;
    category?: string;
    resourceType?: string;
    resourceId?: number;
    metadata?: Record<string, unknown>;
  }) =>
    apiRequest<{ ok: boolean }>("/activity-logs/track", {
      method: "POST",
      json: payload,
    }).catch(() => ({ ok: false })),
};

export const dashboardApi = {
  admin: () => apiRequest<AdminDashboard>("/dashboard/admin"),
  rh: () => apiRequest<RhDashboard>("/dashboard/rh"),
  candidate: () => apiRequest<CandidateDashboard>("/dashboard/candidate"),
};

// ---------- Chatbot ----------

export const chatbotApi = {
  sendMessage: (message: string) =>
    apiRequest<{ reply: string; messageId: number }>("/chatbot/message", {
      method: "POST",
      json: { message },
      auth: true,
    }),
};

export function fileUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const origin = API_URL.replace(/\/api\/?$/, "");
  return `${origin}${path.startsWith("/") ? "" : "/"}${path}`;
}
