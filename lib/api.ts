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

// Types pour les offres du backend
export interface ApiOffre {
  id: number;
  titre: string;
  type: string;
  exigence: string;
  localisation: string;
  date_limite: string;
  date_publication: string;
  statut: string;
  departement?: {
    id: number;
    nom: string;
  };
}

// Types pour les offres du frontend (format attendu par les composants)
export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  department: string;
  description: string;
  postedDate: string;
  deadline: string;
  // Champs supplémentaires pour compatibilité avec JobOfferCard
  category: string;
  salary?: string;
  requirements?: string;
  responsibilities?: string;
  createdAt?: string;
}

// Types pour les candidatures du backend
export interface ApiCandidature {
  id: number;
  statut: 'EN_ATTENTE' | 'ACCEPTEE' | 'REJETEE' | 'ENTRETIEN';
  date_soumission: string;
  score?: number;
  id_offre: number;
  utilisateurcand_id: number;
  utilisateur?: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
  };
  offre?: {
    id: number;
    titre: string;
    type: string;
    localisation: string;
  };
}

// Types pour les candidatures du frontend (format existant dans lib/applications.ts)
export interface Application {
  id: string;
  userId: string;
  jobId: number;
  jobTitle: string;
  status: 'PENDING' | 'IN_REVIEW' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  nom: string;
  email: string;
  telephone: string;
  coverLetter: string;
  cvFileName: string;
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

// Fonction de mapping : transforme une offre du backend vers le format frontend
export function mapOffre(apiOffre: ApiOffre): Job {
  return {
    id: apiOffre.id,
    title: apiOffre.titre,
    company: 'YAS Togo', // Champ inexistant en base, valeur par défaut
    location: apiOffre.localisation,
    type: apiOffre.type,
    department: apiOffre.departement?.nom || 'Non spécifié',
    description: apiOffre.exigence,
    postedDate: new Date(apiOffre.date_publication).toLocaleDateString('fr-FR'),
    deadline: new Date(apiOffre.date_limite).toLocaleDateString('fr-FR'),
    // Champs pour compatibilité avec JobOfferCard
    category: apiOffre.departement?.nom || 'Technologie',
    salary: 'À discuter',
    requirements: apiOffre.exigence,
    responsibilities: apiOffre.exigence,
    createdAt: apiOffre.date_publication,
  };
}

// Mapping des statuts backend vers frontend
const STATUS_MAPPING: Record<string, Application['status']> = {
  'EN_ATTENTE': 'PENDING',
  'ACCEPTEE': 'ACCEPTED',
  'REJETEE': 'REJECTED',
  'ENTRETIEN': 'INTERVIEW',
};

const STATUS_REVERSE_MAPPING: Record<Application['status'], string> = {
  'PENDING': 'EN_ATTENTE',
  'ACCEPTED': 'ACCEPTEE',
  'REJECTED': 'REJETEE',
  'INTERVIEW': 'ENTRETIEN',
  'IN_REVIEW': 'EN_ATTENTE', // Fallback
};

// Fonction de mapping : transforme une candidature backend vers format frontend
export function mapCandidature(apiCandidature: ApiCandidature): Application {
  return {
    id: String(apiCandidature.id),
    userId: String(apiCandidature.utilisateurcand_id),
    jobId: apiCandidature.id_offre,
    jobTitle: apiCandidature.offre?.titre || 'Offre inconnue',
    status: STATUS_MAPPING[apiCandidature.statut] || 'PENDING',
    createdAt: new Date(apiCandidature.date_soumission).toISOString(),
    nom: apiCandidature.utilisateur?.nom || '',
    email: apiCandidature.utilisateur?.email || '',
    telephone: apiCandidature.utilisateur?.telephone || '',
    coverLetter: '', // Non disponible en base pour l'instant
    cvFileName: '', // Non disponible en base pour l'instant
  };
}

// Fonction inverse : transforme statut frontend vers backend
export function mapStatusToFrontend(status: string): Application['status'] {
  return STATUS_MAPPING[status] || 'PENDING';
}

export function mapStatusToBackend(status: Application['status']): string {
  return STATUS_REVERSE_MAPPING[status] || 'EN_ATTENTE';
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

  getOffres: () =>
    request<ApiOffre[]>('/api/offres'),

  getOffreById: (id: number) =>
    request<ApiOffre>(`/api/offres/${id}`),

  // Candidatures
  postuler: (data: {
    id_offre: number;
    lettre_motivation?: string;
    cv?: string;
  }) =>
    request<ApiCandidature>('/api/candidatures', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMyApplications: () =>
    request<ApiCandidature[]>('/api/candidatures/mes'),

  getAllApplications: () =>
    request<ApiCandidature[]>('/api/candidatures'),

  getApplicationById: (id: number) =>
    request<ApiCandidature>(`/api/candidatures/${id}`),

  updateApplicationStatus: (id: number, statut: string) =>
    request<ApiCandidature>(`/api/candidatures/${id}/statut`, {
      method: 'PUT',
      body: JSON.stringify({ statut }),
    }),

  deleteApplication: (id: number) =>
    request<void>(`/api/candidatures/${id}`, {
      method: 'DELETE',
    }),

  // Offres RH (gestion)
  createOffre: (data: {
    titre: string;
    type?: string;
    exigence?: string;
    localisation?: string;
    date_limite?: string;
    id_departement: number;
    exigences_fichier?: string;
  }) =>
    request<ApiOffre>('/api/offres', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateOffre: (id: number, data: {
    titre?: string;
    type?: string;
    exigence?: string;
    localisation?: string;
    date_limite?: string;
    id_departement?: number;
    exigences_fichier?: string;
  }) =>
    request<ApiOffre>(`/api/offres/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateOffreStatus: (id: number, statut: 'BROUILLON' | 'PUBLIEE' | 'FERMEE') =>
    request<ApiOffre>(`/api/offres/${id}/statut`, {
      method: 'PUT',
      body: JSON.stringify({ statut }),
    }),

  deleteOffre: (id: number) =>
    request<{ message: string }>(`/api/offres/${id}`, {
      method: 'DELETE',
    }),

  // Entretiens
  createEntretien: (data: {
    date: string;
    type: 'presentiel' | 'visio';
    statut?: string;
    commentaire?: string;
    id_candidature: number;
    utilisateursup_id?: number;
    lien_meeting?: string;
    plateforme?: string;
    duree?: number;
  }) =>
    request<any>('/api/entretiens', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getEntretiens: () =>
    request<any[]>('/api/entretiens', {
      method: 'GET',
    }),

  getEntretienById: (id: number) =>
    request<any>(`/api/entretiens/${id}`, {
      method: 'GET',
    }),

  updateEntretien: (id: number, data: {
    date?: string;
    type?: 'presentiel' | 'visio';
    statut?: string;
    commentaire?: string;
    utilisateursup_id?: number;
    lien_meeting?: string;
    plateforme?: string;
    duree?: number;
  }) =>
    request<any>(`/api/entretiens/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteEntretien: (id: number) =>
    request<{ message: string }>(`/api/entretiens/${id}`, {
      method: 'DELETE',
    }),
};

export { ApiError };
