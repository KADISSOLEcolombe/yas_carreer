const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export type UserRole = 'CANDIDAT' | 'RH' | 'ADMIN' | 'SUPERVISEUR';

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
  active?: boolean;
  sexe?: string | null;
  ville?: string | null;
  annees_experience?: number | null;
  niveau_etude?: string | null;
  domaine_etudes?: string | null;
  competences?: string | null;
}

export interface RhStats {
  offresCount: number;
  candidaturesCount: number;
  enAttenteCount: number;
  candidatsCount: number;
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
  _count?: {
    candidatures: number;
  };
  competences?: string | null;
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
  candidaturesCount?: number;
  statut?: string;
}

export interface HistoriqueStatutEntry {
  id: number;
  id_candidature: number;
  ancien_statut: string | null;
  nouveau_statut: string;
  date_changement: string;
  id_auteur: number | null;
}

// Types pour les candidatures du backend
export interface ApiCandidature {
  id: number;
  statut: 'EN_ATTENTE' | 'EN_EXAMEN' | 'ENTRETIEN' | 'ACCEPTEE' | 'REJETEE';
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
  score?: number | null;
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
    ...(options.headers as Record<string, string>),
  };

  // Ajoute Content-Type automatiquement sauf pour FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

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
    candidaturesCount: apiOffre._count?.candidatures,
    statut: apiOffre.statut,
  };
}

// Mapping des statuts backend vers frontend
const STATUS_MAPPING: Record<string, Application['status']> = {
  'EN_ATTENTE': 'PENDING',
  'EN_EXAMEN': 'IN_REVIEW',
  'ACCEPTEE': 'ACCEPTED',
  'REJETEE': 'REJECTED',
  'ENTRETIEN': 'INTERVIEW',
};

const STATUS_REVERSE_MAPPING: Record<Application['status'], string> = {
  'PENDING': 'EN_ATTENTE',
  'IN_REVIEW': 'EN_EXAMEN',
  'ACCEPTED': 'ACCEPTEE',
  'REJECTED': 'REJETEE',
  'INTERVIEW': 'ENTRETIEN',
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
    score: apiCandidature.score,
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

  updateProfile: (data: {
    nom?: string;
    prenom?: string;
    telephone?: string;
    quartier?: string;
    password?: string;
    sexe?: string;
    ville?: string;
    annees_experience?: number | null;
    niveau_etude?: string;
    domaine_etudes?: string;
    competences?: string;
  }) =>
    request<{ user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  rhStats: () =>
    request<RhStats>('/api/rh/stats'),

  getSuperviseurs: () =>
    request<Array<{ id: number; nom: string; prenom: string; email: string }>>('/api/rh/superviseurs'),

  getAdminStats: () =>
    request<{
      totaux: { utilisateurs: number; offres: number; offresPubliees: number; candidatures: number };
      utilisateursParRole: Array<{ role: string; count: number }>;
      candidaturesParStatut: Array<{ statut: string; count: number }>;
      offresParDepartement: Array<{ departement: string; count: number }>;
    }>('/api/admin/stats'),

  // Gestion des utilisateurs (Admin)
  getUsers: () =>
    request<User[]>('/api/admin/users'),

  createRhAccount: (data: { nom: string; prenom?: string; email: string; telephone?: string; quartier?: string; password: string }) =>
    request<{ user: User }>('/api/admin/users/rh', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createSuperviseurAccount: (data: { nom: string; prenom?: string; email: string; telephone?: string; quartier?: string; password: string }) =>
    request<{ user: User }>('/api/admin/users/superviseur', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createAdminAccount: (data: { nom: string; prenom?: string; email: string; telephone?: string; quartier?: string; password: string }) =>
    request<{ user: User }>('/api/admin/users/admin', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  toggleUserStatus: (id: number, actif: boolean) =>
    request<{ user: User }>(`/api/admin/users/${id}/statut`, {
      method: 'PUT',
      body: JSON.stringify({ actif }),
    }),

  deleteUser: (id: number) =>
    request<{ message: string }>(`/api/admin/users/${id}`, {
      method: 'DELETE',
    }),

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
    request<ApiOffre[]>('/api/offres/rh/toutes'),

  getOffres: () =>
    request<ApiOffre[]>('/api/offres'),

  getDepartements: () =>
    request<Array<{ id: number; nom: string; description: string }>>('/api/departements'),

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

  getApplicationHistorique: (id: number) =>
    request<HistoriqueStatutEntry[]>(`/api/candidatures/${id}/historique`),

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
    competences?: string;
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
    competences?: string;
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

  getMyEntretiens: () =>
    request<any[]>('/api/entretiens/mes', {
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

  // Emplois (affectations stage/CDI/CDD)
  createEmploi: (data: {
    can_id: number;
    id_departement: number;
    date_debut: string;
    date_fin: string;
    sujet: string;
    lieu: string;
    utilisateursup_id?: number;
  }) =>
    request<any>('/api/emplois', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getEmplois: () =>
    request<any[]>('/api/emplois'),

  getEmploisAEvaluer: () =>
    request<any[]>('/api/emplois/a-evaluer'),

  // Évaluations
  getEvaluations: () =>
    request<any[]>('/api/evaluations'),

  getEvaluationById: (id: number) =>
    request<any>(`/api/evaluations/${id}`),

  createEvaluation: (data: { id_emploi: number; note?: number; fichier_rapport: string; statut: boolean }) =>
    request<any>('/api/evaluations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Fichiers
  uploadFile: (file: File, id_candidature?: number, libelle?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (id_candidature) formData.append('id_candidature', id_candidature.toString());
    if (libelle) formData.append('libelle', libelle);

    return request<{ id: number; libelle: string; chemin: string; extension: string; id_candidature: number | null }>('/api/files/upload', {
      method: 'POST',
      body: formData,
    });
  },

  getFilesByCandidature: (id_candidature: number) =>
    request<{ id: number; libelle: string; chemin: string; extension: string; id_candidature: number }[]>(`/api/files/candidature/${id_candidature}`, {
      method: 'GET',
    }),

  getMyFiles: () =>
    request<{ id: number; libelle: string; chemin: string; extension: string }[]>('/api/files/mes'),

  deleteFile: (id: number) =>
    request<{ message: string }>(`/api/files/${id}`, {
      method: 'DELETE',
    }),

  // Favoris
  getFavoris: () =>
    request<Array<{ id: number; id_offre: number; offre: ApiOffre }>>('/api/favoris'),

  addFavori: (id_offre: number) =>
    request<{ id: number; id_offre: number }>('/api/favoris', {
      method: 'POST',
      body: JSON.stringify({ id_offre }),
    }),

  removeFavori: (id_offre: number) =>
    request<{ message: string }>(`/api/favoris/${id_offre}`, {
      method: 'DELETE',
    }),

  syncFavoris: (id_offres: number[]) =>
    request<{ message: string }>('/api/favoris/sync', {
      method: 'POST',
      body: JSON.stringify({ id_offres }),
    }),

  // Notifications
  getNotifications: () =>
    request<any[]>('/api/notifications', {
      method: 'GET',
    }),

  getUnreadNotifications: () =>
    request<{ count: number; notifications: any[] }>('/api/notifications/non-lues', {
      method: 'GET',
    }),

  markAsRead: (id: number) =>
    request<any>(`/api/notifications/${id}/lu`, {
      method: 'PUT',
    }),

  markAllAsRead: () =>
    request<{ message: string }>('/api/notifications/tout-lu', {
      method: 'PUT',
    }),

  sendNotification: (data: { id_utilisateur: number; titre: string; contenu: string }) =>
    request<any>('/api/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getSentNotifications: () =>
    request<Array<{
      id: number;
      titre: string;
      contenu: string;
      date_envoi: string;
      utilisateur: { id: number; nom: string; prenom: string };
    }>>('/api/notifications/envoyees'),
};

export { ApiError };
