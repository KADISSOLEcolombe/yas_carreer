const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export type UserRole = 'CANDIDATE' | 'RECRUITER' | 'ADMIN' | 'SUPERVISOR';

export interface User {
  id: string;
  nom: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface RhStats {
  offersCount: number;
  applicationsCount: number;
  pendingCount: number;
  candidatesCount: number;
}

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data.error || 'Une erreur est survenue', res.status);
  }

  return data as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (nom: string, email: string, password: string) =>
    request<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ nom, email, password }),
    }),

  me: (token: string) =>
    request<{ user: User }>('/api/auth/me', {}, token),

  rhStats: (token: string) =>
    request<RhStats>('/api/rh/stats', {}, token),

  rhApplications: (token: string) =>
    request<
      Array<{
        id: number;
        status: string;
        createdAt: string;
        telephone: string | null;
        coverLetter: string | null;
        cvFileName: string | null;
        user: { id: number; nom: string; email: string };
        jobOffer: { id: number; title: string; companyName: string };
      }>
    >('/api/rh/applications', {}, token),

  rhOffers: (token: string) =>
    request<
      Array<{
        id: number;
        title: string;
        companyName: string;
        location: string;
        type: string;
        salary: string | null;
        _count: { applications: number };
      }>
    >('/api/rh/offers', {}, token),
};

export { ApiError };
