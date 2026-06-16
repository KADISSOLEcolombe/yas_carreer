export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  active?: boolean;
  createdAt?: string;
}

const STORAGE_KEY = 'yas_jobs';

export const DEFAULT_JOBS: Job[] = [
  {
    id: 1,
    title: 'Développeur Full Stack',
    company: 'YAS Togo',
    location: 'Lomé',
    type: 'CDI',
    salary: 'À discuter',
    description: 'Nous recherchons un développeur Full Stack talentueux pour rejoindre notre équipe en pleine croissance.',
    requirements: [
      'Expérience avec React/Next.js',
      'Maîtrise de Node.js',
      'Connaissance des bases de données relationnelles',
      'Expérience avec Prisma',
      'Bonnes compétences en communication',
    ],
    responsibilities: [
      'Développer et maintenir les applications web',
      'Collaborer avec l\'équipe design et produit',
      'Participer aux revues de code',
      'Contribuer à l\'amélioration continue',
    ],
    active: true,
  },
  {
    id: 2,
    title: 'Product Manager',
    company: 'YAS Togo',
    location: 'Lomé',
    type: 'CDI',
    salary: 'À discuter',
    description: 'En tant que Product Manager chez YAS Togo, vous serez responsable de la vision et de l\'exécution du produit.',
    requirements: [
      '3+ ans d\'expérience en Product Management',
      'Maîtrise des méthodologies Agile',
      'Excellente communication',
      'Expérience dans le secteur tech',
    ],
    responsibilities: [
      'Définir la roadmap produit',
      'Prioriser les fonctionnalités',
      'Travailler avec les parties prenantes',
      'Analyser les données utilisateurs',
    ],
    active: true,
  },
  {
    id: 3,
    title: 'Designer UX/UI',
    company: 'YAS Togo',
    location: 'Lomé',
    type: 'Stage',
    salary: 'Indemnité',
    description: 'Stage de 6 mois pour un Designer UX/UI passionné.',
    requirements: [
      'Maîtrise de Figma',
      'Compréhension des principes UX',
      'Portfolio de projets',
      'Bonne communication',
    ],
    responsibilities: [
      'Créer des maquettes et prototypes',
      'Réaliser des tests utilisateurs',
      'Collaborer avec l\'équipe de développement',
      'Améliorer l\'interface utilisateur',
    ],
    active: true,
  },
  {
    id: 4,
    title: 'Data Scientist',
    company: 'YAS Togo',
    location: 'Lomé',
    type: 'CDI',
    salary: 'À discuter',
    description: 'Rejoignez notre équipe data pour construire des solutions innovantes.',
    requirements: [
      'Expérience avec Python/R',
      'Connaissance des algorithmes ML',
      'Bases de données SQL/NoSQL',
      'Visualisation des données',
    ],
    responsibilities: [
      'Analyser les données',
      'Développer des modèles prédictifs',
      'Créer des dashboards',
      'Collaborer avec les équipes métier',
    ],
    active: true,
  },
  {
    id: 5,
    title: 'Community Manager',
    company: 'YAS Togo',
    location: 'Lomé',
    type: 'Stage',
    salary: 'Indemnité',
    description: 'Gérer et animer la communauté YAS Togo sur les réseaux sociaux.',
    requirements: [
      'Expérience avec les réseaux sociaux',
      'Bonne rédaction en français',
      'Créativité',
      'Sens de la communication',
    ],
    responsibilities: [
      'Gérer les comptes réseaux sociaux',
      'Créer du contenu engageant',
      'Interagir avec la communauté',
      'Analyser les performances',
    ],
    active: true,
  },
  {
    id: 6,
    title: 'Responsable RH',
    company: 'YAS Togo',
    location: 'Lomé',
    type: 'CDI',
    salary: 'À discuter',
    description: 'Diriger le département des ressources humaines de YAS Togo.',
    requirements: [
      '5+ ans d\'expérience en RH',
      'Connaissance du droit du travail',
      'Bonnes compétences relationnelles',
      'Expérience en recrutement',
    ],
    responsibilities: [
      'Gérer le recrutement',
      'Développer les talents',
      'Gérer les relations sociales',
      'Piloter la performance',
    ],
    active: true,
  },
];

function isValidJob(job: unknown): job is Job {
  if (!job || typeof job !== 'object') return false;
  const j = job as Job;
  return typeof j.id === 'number' && typeof j.title === 'string' && j.title.length > 0;
}

function seedDefaultJobs(): Job[] {
  return DEFAULT_JOBS.map((j) => ({
    ...j,
    active: true,
    createdAt: new Date().toISOString(),
  }));
}

function notifyJobsUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('yas-jobs-updated'));
  }
}

function safeSaveJobs(jobs: Job[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
    console.log(`safeSaveJobs: ${jobs.length} offres sauvegardées dans localStorage`);
    notifyJobsUpdated();
  } catch (error) {
    console.error('safeSaveJobs: erreur de sauvegarde', error);
    // localStorage plein ou indisponible
  }
}

function parseJobs(): Job[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      console.log('parseJobs: localStorage vide');
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.log('parseJobs: données invalides (pas un tableau)');
      return [];
    }
    const validJobs = parsed.filter(isValidJob);
    console.log(`parseJobs: ${validJobs.length} offres valides trouvées sur ${parsed.length}`);
    return validJobs;
  } catch (error) {
    console.error('parseJobs: erreur de parsing', error);
    return [];
  }
}

function getActiveJobs(jobs: Job[]): Job[] {
  return jobs.filter((j) => j.active !== false);
}

export function initJobs() {
  if (typeof window === 'undefined') return;

  try {
    let jobs = parseJobs();

    if (jobs.length === 0) {
      console.log('Initialisation: aucune offre trouvée, création des offres par défaut');
      safeSaveJobs(seedDefaultJobs());
      return;
    }

    if (getActiveJobs(jobs).length === 0) {
      console.log('Initialisation: aucune offre active, réinitialisation aux offres par défaut');
      safeSaveJobs(seedDefaultJobs());
      return;
    }

    const merged = [...jobs];
    let changed = false;
    for (const def of DEFAULT_JOBS) {
      if (!merged.some((j) => j.id === def.id)) {
        merged.push({ ...def, active: true, createdAt: new Date().toISOString() });
        changed = true;
      }
    }

    if (changed) {
      console.log('Initialisation: fusion avec les offres par défaut');
      safeSaveJobs(merged);
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des offres:', error);
    safeSaveJobs(seedDefaultJobs());
  }
}

export function getJobs(includeInactive = false): Job[] {
  if (typeof window === 'undefined') return DEFAULT_JOBS;

  try {
    initJobs();
    const jobs = parseJobs();

    if (jobs.length === 0) {
      console.log('localStorage vide, utilisation des offres par défaut');
      return DEFAULT_JOBS;
    }

    const result = includeInactive ? jobs : getActiveJobs(jobs);

    if (!includeInactive && result.length === 0) {
      console.log('Aucune offre active, utilisation des offres par défaut');
      return DEFAULT_JOBS;
    }

    return result;
  } catch (error) {
    console.error('Erreur dans getJobs, utilisation des offres par défaut:', error);
    return DEFAULT_JOBS;
  }
}

export function getJobById(id: number): Job | undefined {
  const fromStorage = getJobs(true).find((j) => j.id === id);
  if (fromStorage) return fromStorage;
  return DEFAULT_JOBS.find((j) => j.id === id);
}

export function getNextJobId(): number {
  const jobs = getJobs(true);
  return jobs.length === 0 ? 1 : Math.max(...jobs.map((j) => j.id)) + 1;
}

export function saveJob(job: Omit<Job, 'id' | 'createdAt'>): Job {
  initJobs();
  const jobs = parseJobs().length > 0 ? parseJobs() : seedDefaultJobs();
  const newJob: Job = {
    ...job,
    id: getNextJobId(),
    active: job.active ?? true,
    createdAt: new Date().toISOString(),
  };
  jobs.push(newJob);
  safeSaveJobs(jobs);
  return newJob;
}

export function updateJob(id: number, data: Partial<Job>): Job | undefined {
  initJobs();
  const jobs = parseJobs();
  const index = jobs.findIndex((j) => j.id === id);
  if (index === -1) return undefined;
  jobs[index] = { ...jobs[index], ...data };
  safeSaveJobs(jobs);
  return jobs[index];
}

export function deleteJob(id: number): boolean {
  initJobs();
  const jobs = parseJobs();
  const filtered = jobs.filter((j) => j.id !== id);
  if (filtered.length === jobs.length) return false;
  safeSaveJobs(filtered);
  return true;
}

export function resetJobsToDefaults(): void {
  if (typeof window === 'undefined') return;
  console.log('resetJobsToDefaults: réinitialisation forcée aux offres par défaut');
  safeSaveJobs(seedDefaultJobs());
}
