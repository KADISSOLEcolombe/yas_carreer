export interface Interview {
  id: string;
  applicationId: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  dateTime: string;
  location: string;
  notes: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

const STORAGE_KEY = 'yas_interviews';

export function getInterviews(): Interview[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

export function getInterviewByApplication(applicationId: string): Interview | undefined {
  return getInterviews().find((i) => i.applicationId === applicationId && i.status !== 'CANCELLED');
}

export function saveInterview(
  data: Omit<Interview, 'id' | 'createdAt' | 'status'>
): Interview {
  const interview: Interview = {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    status: 'SCHEDULED',
    createdAt: new Date().toISOString(),
  };
  const interviews = getInterviews();
  interviews.push(interview);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(interviews));
  return interview;
}

export function updateInterview(id: string, data: Partial<Interview>): Interview | undefined {
  const interviews = getInterviews();
  const index = interviews.findIndex((i) => i.id === id);
  if (index === -1) return undefined;
  interviews[index] = { ...interviews[index], ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(interviews));
  return interviews[index];
}

export function getUpcomingInterviews(): Interview[] {
  const now = new Date();
  return getInterviews()
    .filter((i) => i.status === 'SCHEDULED' && new Date(i.dateTime) >= now)
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
}
