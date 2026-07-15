const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export type UserRole = 'Candidat' | 'RH' | 'ADMIN' | 'Superviseur';

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  type: UserRole;
  role: UserRole;
  droits: string[];
  telephone?: string;
  quartier?: string;
  supprime?: boolean;
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

// Récupère le token depuis le localStorage
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('yas_token');
}

// Stocke le token dans le localStorage
function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('yas_token', token);
}

// Supprime le token du localStorage
function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('yas_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Ajoute automatiquement le header Authorization si un token existe
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // 401 = session expirée ou invalide → déconnexion automatique
    if (res.status === 401) {
      clearToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    throw new ApiError(data.error || 'Une erreur est survenue', res.status);
  }

  return data as T;
}

export const api = {
  login: async (email: string, password: string) => {
    const response = await request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    // Stocke le token après un login réussi
    setToken(response.token);
    return response;
  },

  register: async (nom: string, email: string, password: string, prenom?: string, telephone?: string, quartier?: string) => {
    const response = await request<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ nom, email, password, prenom, telephone, quartier }),
    });
    setToken(response.token);
    return response;
  },

  me: () =>
    request<{ user: User }>('/api/auth/me'),

  rhStats: () =>
    request<RhStats>('/api/rh/stats'),

  rhApplications: () =>
    request<
      Array<{
        id: number;
        statut: string;
        date_soumission: string;
        utilisateur: { id: number; nom: string; prenom: string; email: string };
        offre: { id: number; titre: string; type: string };
      }>
    >('/api/candidatures'),

  rhOffers: () =>
    request<
      Array<{
        id: number;
        titre: string;
        localisation: string;
        type: string;
        statut: string;
        date_publication: string;
        _count: { candidatures: number };
      }>
    >('/api/offres/rh/toutes'),
};

export { ApiError };
