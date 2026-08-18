import { z } from "zod";

const email = () => z.string().email().max(254);

// Règle appliquée à tout mot de passe nouvellement défini (inscription,
// changement, activation) : 8-64 caractères, au moins un chiffre et un
// caractère spécial. Pas de majuscule obligatoire (décision produit).
const password = () =>
  z
    .string()
    .min(8, "8 caractères minimum")
    .max(64, "64 caractères maximum")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
    .regex(
      /[^A-Za-z0-9]/,
      "Le mot de passe doit contenir au moins un caractère spécial"
    );

// Lettres (incl. accentuées), espaces, tirets et apostrophes uniquement —
// couvre aussi bien un prénom seul que le "fullName" concaténé complet.
const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
const PHONE_REGEX = /^\+?[0-9]{8,15}$/;

export const registerValidator = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "2 caractères minimum")
      .max(120)
      .regex(NAME_REGEX, "Le nom ne doit contenir que des lettres"),
    email: email(),
    password: password(),
    passwordConfirmation: password(),
    phone: z
      .string()
      .trim()
      .max(30)
      .optional()
      .refine((v) => !v || PHONE_REGEX.test(v.replace(/[\s.\-()]/g, "")), {
        message: "Format de téléphone invalide",
      }),
  })
  .refine((d) => d.password === d.passwordConfirmation, {
    message: "Les mots de passe ne correspondent pas",
    path: ["passwordConfirmation"],
  });

export const loginValidator = z.object({
  email: email(),
  password: z.string().min(1, "Mot de passe requis").max(64),
});

export const updateProfileValidator = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  phone: z.string().trim().max(30).nullish(),
  bio: z.string().max(2000).nullish(),
  skills: z.string().max(2000).nullish(),
  anneesEtude: z.string().trim().max(30).nullish(),
  ville: z.string().trim().max(100).nullish(),
  quartier: z.string().trim().max(100).nullish(),
});

export const createUserValidator = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: email(),
  password: password().optional(),
  role: z.enum(["admin", "rh", "superviseur"]),
  phone: z.string().trim().max(30).optional(),
});

export const changePasswordValidator = z
  .object({
    currentPassword: z.string().min(1).optional(),
    password: password(),
    passwordConfirmation: password(),
  })
  .refine((d) => d.password === d.passwordConfirmation, {
    message: "Les mots de passe ne correspondent pas",
    path: ["passwordConfirmation"],
  });

export const updateRoleValidator = z.object({
  role: z.enum(["admin", "rh", "superviseur"]),
});

export const updateDepartementValidator = z.object({
  departementId: z.number().int().positive().nullable(),
});

export const updateStatusValidator = z.object({
  isActive: z.boolean(),
});

export const documentRequirementValidator = z.object({
  nom: z.string().trim().min(1).max(120),
  obligatoire: z.boolean(),
  description: z.string().trim().max(300).optional(),
});

export const offerValidator = z.object({
  title: z.string().trim().min(3).max(200),
  type: z.enum(["stage", "emploi"]),
  description: z.string().trim().min(20),
  requirements: z.string().optional(),
  deadline: z.string().optional(),
  location: z.string().max(120).optional(),
  status: z.enum(["brouillon", "publiee", "fermee"]).optional(),
  aiAnalysisCriteria: z.string().trim().max(4000).optional(),
  documentsRequis: z.array(documentRequirementValidator).max(10).optional(),
  // Obligatoire pour toute nouvelle création/modification d'offre ; les
  // offres créées avant cette règle restent en base sans département
  // (aucune migration forcée), seule l'écriture est désormais bloquée.
  departementId: z.number().int().positive(),
});

export const offerAiCriteriaValidator = z.object({
  aiAnalysisCriteria: z.string().trim().max(4000).nullable(),
});

export const offerAssistValidator = z.object({
  brief: z.string().trim().min(10).max(4000),
  type: z.enum(["stage", "emploi"]).optional(),
});

export const applicationStoreValidator = z.object({
  offerId: z.coerce.number().int(),
  coverLetterText: z.string().trim().min(20).max(8000).optional(),
});

export const activateAccountValidator = z
  .object({
    token: z.string().trim().min(20).max(500),
    password: password(),
    passwordConfirmation: password(),
  })
  .refine((d) => d.password === d.passwordConfirmation, {
    message: "Les mots de passe ne correspondent pas",
    path: ["passwordConfirmation"],
  });

export const applicationStatusValidator = z.object({
  status: z.enum([
    "envoyee",
    "en_cours_analyse",
    "preselectionnee",
    "entretien_programme",
    "entretien_realise",
    "acceptee",
    "rejetee",
  ]),
  force: z.boolean().optional(),
  note: z.string().trim().max(1000).optional(),
});

export const applicationNoteValidator = z.object({
  content: z.string().trim().min(2).max(4000),
});

export const candidateDocumentValidator = z.object({
  label: z.string().trim().min(1).max(120),
});

export const notifyCandidatesValidator = z.object({
  applicationIds: z.array(z.coerce.number().int()).min(1).max(50),
  message: z.string().trim().max(4000).optional(),
});

export const finalizeSelectionValidator = z.object({
  retainedApplicationIds: z.array(z.coerce.number().int()).default([]),
});

export const interviewValidator = z
  .object({
    applicationId: z.coerce.number().int(),
    supervisorId: z.coerce.number().int().optional(),
    scheduledAt: z.string(),
    durationMinutes: z.coerce.number().int().min(5).max(480).default(30),
    mode: z.enum(["presentiel", "distanciel"]),
    location: z.string().trim().max(200).optional(),
    meetingLink: z.string().trim().url().optional(),
    notes: z.string().max(2000).optional(),
  })
  .refine((d) => d.mode !== "presentiel" || Boolean(d.location?.trim()), {
    message: "Le lieu est requis pour un entretien présentiel",
    path: ["location"],
  });

export const interviewOutcomeValidator = z.object({
  status: z.enum(["planifie", "termine", "annule"]),
  notes: z.string().max(2000).nullish(),
});

export const availableSlotValidator = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide (AAAA-MM-JJ)"),
  start: z.string().regex(/^\d{2}:\d{2}$/, "Heure invalide (HH:MM)"),
  end: z.string().regex(/^\d{2}:\d{2}$/, "Heure invalide (HH:MM)"),
});

export const interviewRequestRespondValidator = z.object({
  status: z.enum(["disponible", "indisponible"]),
  availabilityNote: z.string().trim().max(1000).optional(),
  availableSlots: z.array(availableSlotValidator).max(50).optional(),
});

// Demande de disponibilité générique (page Entretiens) : ne concerne aucune
// candidature précise, juste une collecte de créneaux auprès de superviseurs.
export const requestAvailabilityValidator = z.object({
  supervisorIds: z.array(z.coerce.number().int()).min(1).max(50),
  proposedSlots: z.array(availableSlotValidator).min(1).max(100),
  message: z.string().trim().min(1).max(4000),
});

export const emploiValidator = z.object({
  applicationId: z.coerce.number().int(),
  supervisorId: z.coerce.number().int(),
  department: z.string().trim().max(120).optional(),
  contractType: z.enum(["stage", "cdd", "cdi"]),
  startDate: z.string(),
  endDate: z.string().optional(),
});

export const supervisionNoteBaseValidator = z.object({
  emploiId: z.coerce.number().int().optional(),
  applicationId: z.coerce.number().int().optional(),
  type: z.enum(["rapport", "evaluation", "observation"]),
  title: z.string().trim().max(200).optional(),
  content: z.string().trim().min(2).max(8000),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  recommendation: z.enum(["favorable", "a_revoir", "defavorable"]).optional(),
});

export const supervisionNoteValidator = supervisionNoteBaseValidator.refine(
  (d) => Boolean(d.emploiId) !== Boolean(d.applicationId),
  {
    message: "Renseignez soit emploiId (suivi collaborateur), soit applicationId (évaluation d'entretien), pas les deux",
    path: ["emploiId"],
  }
);

export const chatbotValidator = z.object({
  message: z.string().trim().min(2).max(2000),
});

export const activityTrackValidator = z.object({
  action: z.string().trim().min(2).max(80),
  category: z.string().trim().max(40).optional(),
  summary: z.string().trim().min(2).max(500),
  resourceType: z.string().trim().max(60).optional(),
  resourceId: z.coerce.number().int().optional(),
  metadata: z.any().optional(),
});
