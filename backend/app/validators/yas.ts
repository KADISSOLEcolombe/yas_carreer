import vine from '@vinejs/vine'

const email = () => vine.string().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(64)

export const registerValidator = vine.create({
  fullName: vine.string().trim().minLength(2).maxLength(120),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password(),
  passwordConfirmation: password().sameAs('password'),
  phone: vine.string().trim().maxLength(30).optional(),
})

export const loginValidator = vine.create({
  email: email(),
  password: vine.string(),
})

export const updateProfileValidator = vine.create({
  fullName: vine.string().trim().minLength(2).maxLength(120).optional(),
  phone: vine.string().trim().maxLength(30).nullable().optional(),
  bio: vine.string().maxLength(2000).nullable().optional(),
  skills: vine.string().maxLength(2000).nullable().optional(),
})

export const createUserValidator = vine.create({
  fullName: vine.string().trim().minLength(2).maxLength(120),
  email: email().unique({ table: 'users', column: 'email' }),
  /** Si omis, un mot de passe temporaire est généré et envoyé par email. */
  password: password().optional(),
  role: vine.enum(['admin', 'rh'] as const),
  phone: vine.string().trim().maxLength(30).optional(),
})

export const changePasswordValidator = vine.create({
  currentPassword: vine.string().minLength(1).optional(),
  password: password(),
  passwordConfirmation: password().sameAs('password'),
})

export const updateRoleValidator = vine.create({
  role: vine.enum(['admin', 'rh'] as const),
})

export const updateStatusValidator = vine.create({
  isActive: vine.boolean(),
})

export const offerValidator = vine.create({
  title: vine.string().trim().minLength(3).maxLength(200),
  type: vine.enum(['stage', 'emploi'] as const),
  description: vine.string().trim().minLength(20),
  requirements: vine.string().optional(),
  deadline: vine.string().optional(),
  location: vine.string().maxLength(120).optional(),
  status: vine.enum(['brouillon', 'publiee', 'fermee'] as const).optional(),
  aiAnalysisCriteria: vine.string().trim().maxLength(4000).optional(),
})

export const offerAiCriteriaValidator = vine.create({
  aiAnalysisCriteria: vine.string().trim().maxLength(4000).nullable(),
})

export const offerAssistValidator = vine.create({
  brief: vine.string().trim().minLength(10).maxLength(4000),
  type: vine.enum(['stage', 'emploi'] as const).optional(),
})

export const applicationStoreValidator = vine.create({
  offerId: vine.number().withoutDecimals(),
  coverLetterText: vine.string().trim().minLength(20).maxLength(8000).optional(),
})

export const guestApplicationValidator = vine.create({
  offerId: vine.number().withoutDecimals(),
  fullName: vine.string().trim().minLength(2).maxLength(120),
  email: email(),
  phone: vine.string().trim().maxLength(30).optional(),
  coverLetterText: vine.string().trim().minLength(20).maxLength(8000).optional(),
  skills: vine.string().trim().maxLength(2000).optional(),
  bio: vine.string().trim().maxLength(2000).optional(),
})

export const activateAccountValidator = vine.create({
  token: vine.string().trim().minLength(20).maxLength(500),
  password: password(),
  passwordConfirmation: password().sameAs('password'),
})

export const applicationStatusValidator = vine.create({
  status: vine.enum([
    'envoyee',
    'en_cours_analyse',
    'entretien_programme',
    'acceptee',
    'rejetee',
  ] as const),
  force: vine.boolean().optional(),
})

export const notifyCandidatesValidator = vine.create({
  applicationIds: vine.array(vine.number().withoutDecimals()).minLength(1).maxLength(50),
  message: vine.string().trim().maxLength(4000).optional(),
})

export const interviewValidator = vine.create({
  applicationId: vine.number().withoutDecimals(),
  scheduledAt: vine.string(),
  meetingLink: vine.string().url().optional(),
  mode: vine.enum(['presentiel', 'distanciel'] as const),
  notes: vine.string().maxLength(2000).optional(),
})

export const chatbotValidator = vine.create({
  message: vine.string().trim().minLength(2).maxLength(2000),
})
