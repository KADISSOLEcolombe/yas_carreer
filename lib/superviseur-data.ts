export type EvaluationStatus = 'Validée' | 'En attente';
export type InterviewStatus = 'Confirmé' | 'À confirmer';

export interface SupervisorCandidate {
  id: number;
  nom: string;
  poste: string;
}

export interface SupervisorEvaluation {
  id: number;
  nom: string;
  poste: string;
  note: string;
  status: EvaluationStatus;
  date: string;
}

export interface SupervisorInterview {
  id: number;
  nom: string;
  poste: string;
  date: string;
  heure: string;
  status: InterviewStatus;
}

export const OVERVIEW_STATS = [
  { label: 'Évaluations réalisées', value: 8, bg: '#1e3a8a' },
  { label: "En attente d'évaluation", value: 3, bg: '#facc15', darkText: true },
  { label: 'Entretiens à venir', value: 2, bg: '#16a34a' },
] as const;

export const CANDIDATS_A_EVALUER: SupervisorCandidate[] = [
  { id: 1, nom: 'Afi Kossi', poste: 'Développeur Full Stack' },
  { id: 2, nom: 'Kodjo Mensah', poste: 'Chargé(e) de Communication' },
  { id: 3, nom: 'Akossiwa Gnammi', poste: 'Stage – Analyste Business' },
  { id: 4, nom: 'Yao Agbemadon', poste: 'Commercial Terrain' },
];

export const DERNIERES_EVALUATIONS: SupervisorEvaluation[] = [
  { id: 1, nom: 'Kokou Kpatcha', poste: 'Développeur Full Stack', note: '15/20', status: 'Validée', date: '08/07/2026' },
  { id: 2, nom: 'Amévi Lawson', poste: 'Stage – Analyste Business', note: '13/20', status: 'En attente', date: '07/07/2026' },
  { id: 3, nom: 'Kodjo Mensah', poste: 'Chargé(e) de Communication', note: '17/20', status: 'Validée', date: '05/07/2026' },
];

export const MES_EVALUATIONS: SupervisorEvaluation[] = [
  { id: 4, nom: 'Afi Kossi', poste: 'Développeur Full Stack', note: '16/20', status: 'Validée', date: '04/07/2026' },
  { id: 5, nom: 'Akossiwa Gnammi', poste: 'Stage – Analyste Business', note: '12/20', status: 'En attente', date: '03/07/2026' },
  { id: 6, nom: 'Yao Agbemadon', poste: 'Commercial Terrain', note: '14/20', status: 'Validée', date: '01/07/2026' },
];

export const MES_ENTRETIENS: SupervisorInterview[] = [
  { id: 1, nom: 'Kokou Kpatcha', poste: 'Développeur Full Stack', date: '10/07/2026', heure: '09:00', status: 'Confirmé' },
  { id: 2, nom: 'Kodjo Mensah', poste: 'Chargé(e) de Communication', date: '11/07/2026', heure: '14:30', status: 'À confirmer' },
  { id: 3, nom: 'Amévi Lawson', poste: 'Stage – Analyste Business', date: '12/07/2026', heure: '11:00', status: 'Confirmé' },
];
