export type ApplicationStatus = 'PENDING' | 'IN_REVIEW' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED';

export interface Application {
  id: string;
  userId: string;
  jobId: number;
  jobTitle: string;
  status: ApplicationStatus;
  createdAt: string;
  nom: string;
  email: string;
  telephone: string;
  coverLetter: string;
  cvFileName: string;
}

const STORAGE_KEY = 'yas_applications';

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: 'En attente',
  IN_REVIEW: 'En examen',
  INTERVIEW: 'Entretien',
  ACCEPTED: 'Acceptée',
  REJECTED: 'Refusée',
};

export function getApplications(): Application[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

export function getUserApplications(userId: string): Application[] {
  return getApplications().filter((app) => app.userId === userId);
}

export function getApplicationById(id: string): Application | undefined {
  return getApplications().find((app) => app.id === id);
}

export function hasApplied(userId: string, jobId: number): boolean {
  return getApplications().some((app) => app.userId === userId && app.jobId === jobId);
}

export function saveApplication(application: Omit<Application, 'id' | 'createdAt' | 'status'>): Application {
  const newApp: Application = {
    ...application,
    id: Math.random().toString(36).substr(2, 9),
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };

  const apps = getApplications();
  apps.push(newApp);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  return newApp;
}

export function updateApplicationStatus(id: string, status: ApplicationStatus): Application | undefined {
  const apps = getApplications();
  const index = apps.findIndex((app) => app.id === id);
  if (index === -1) return undefined;
  apps[index].status = status;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  return apps[index];
}

export function getApplicationsByJob(jobId: number): Application[] {
  return getApplications().filter((app) => app.jobId === jobId);
}

export function getApplicationStats() {
  const apps = getApplications();
  return {
    total: apps.length,
    pending: apps.filter((a) => a.status === 'PENDING').length,
    inReview: apps.filter((a) => a.status === 'IN_REVIEW').length,
    interview: apps.filter((a) => a.status === 'INTERVIEW').length,
    accepted: apps.filter((a) => a.status === 'ACCEPTED').length,
    rejected: apps.filter((a) => a.status === 'REJECTED').length,
  };
}
