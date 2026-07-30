import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import Application from '#models/application'
import Offer from '#models/offer'
import CandidateProfile from '#models/candidate_profile'
import User from '#models/user'
import { applicationStoreValidator, applicationStatusValidator, guestApplicationValidator, notifyCandidatesValidator } from '#validators/yas'
import ApplicationStatusService from '#services/application_status_service'
import NotificationService from '#services/notification_service'
import MailService from '#services/mail_service'
import StorageService from '#services/storage_service'
import AiService, { scoreToGrade } from '#services/ai_service'
import DocumentReaderService from '#services/document_reader_service'
import WebResearchService from '#services/web_research_service'
import AccountActivationService from '#services/account_activation_service'
import env from '#start/env'
import { APPLICATION_STATUS_LABELS, type ApplicationStatus } from '#types/domain'
import ActivityLogService from '#services/activity_log_service'

export default class ApplicationsController {
  async store({ request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(applicationStoreValidator)

    const offer = await Offer.find(payload.offerId)
    if (!offer || offer.status !== 'publiee') {
      return response.badRequest({ message: 'Offre non disponible' })
    }

    const existing = await Application.query()
      .where('offer_id', offer.id)
      .where('user_id', user.id)
      .first()
    if (existing) {
      return response.conflict({ message: 'Vous avez déjà postulé à cette offre' })
    }

    let cvUrl: string | null = null
    let coverLetterUrl: string | null = null
    const cv = request.file('cv', { size: '5mb', extnames: ['pdf', 'doc', 'docx'] })
    const cover = request.file('coverLetter', { size: '5mb', extnames: ['pdf', 'doc', 'docx'] })

    if (cv) cvUrl = await StorageService.saveUpload(cv, 'cv')
    if (cover) coverLetterUrl = await StorageService.saveUpload(cover, 'cover')

    if (!cvUrl) {
      const profile = await CandidateProfile.findBy('userId', user.id)
      cvUrl = profile?.cvUrl || null
    }

    const application = await Application.create({
      offerId: offer.id,
      userId: user.id,
      cvUrl,
      coverLetterUrl,
      coverLetterText: payload.coverLetterText || null,
      status: 'envoyee',
      appliedAt: DateTime.now(),
    })

    await ApplicationStatusService.recordInitial(application, user.id)

    await NotificationService.notifyStaff(
      'new_application',
      `Nouvelle candidature de ${user.fullName || user.email} pour « ${offer.title} ».`
    )

    void MailService.sendApplicationConfirmationEmail(user, offer.title)
    void this.runAiAnalyze(application.id)

    return { data: application }
  }

  /**
   * Candidature publique sans connexion préalable.
   * Crée ou rattache un compte candidat via l'email.
   */
  async guestStore({ request, response }: HttpContext) {
    const payload = await request.validateUsing(guestApplicationValidator)

    const offer = await Offer.find(payload.offerId)
    if (!offer || offer.status !== 'publiee') {
      return response.badRequest({ message: 'Offre non disponible' })
    }

    const email = payload.email.toLowerCase().trim()
    let user = await User.findBy('email', email)
    let isNewAccount = false

    if (user) {
      if (user.role !== 'candidat') {
        return response.conflict({
          message:
            'Cet email est déjà associé à un compte RH/admin. Utilisez une autre adresse email.',
        })
      }
      if (!user.isActive) {
        return response.forbidden({ message: 'Compte désactivé' })
      }
      if (payload.fullName && (!user.fullName || user.fullName.length < 2)) {
        user.fullName = payload.fullName
      }
      if (payload.phone) user.phone = payload.phone
      await user.save()
    } else {
      isNewAccount = true
      user = await User.create({
        fullName: payload.fullName,
        email,
        password: AccountActivationService.randomPassword(),
        phone: payload.phone || null,
        role: 'candidat',
        isActive: true,
        mustChangePassword: true,
      })
      await CandidateProfile.create({
        userId: user.id,
        bio: payload.bio || null,
        skills: payload.skills || null,
        cvUrl: null,
        aiExtractedData: null,
      })
    }

    const existing = await Application.query()
      .where('offer_id', offer.id)
      .where('user_id', user.id)
      .first()
    if (existing) {
      return response.conflict({
        message: 'Une candidature existe déjà pour cet email sur cette offre.',
      })
    }

    const cv = request.file('cv', { size: '5mb', extnames: ['pdf', 'doc', 'docx'] })
    const cover = request.file('coverLetter', { size: '5mb', extnames: ['pdf', 'doc', 'docx'] })
    if (!cv) {
      return response.badRequest({ message: 'Le CV est obligatoire' })
    }

    const cvUrl = await StorageService.saveUpload(cv, 'cv')
    let coverLetterUrl: string | null = null
    if (cover) coverLetterUrl = await StorageService.saveUpload(cover, 'cover')

    let profile = await CandidateProfile.findBy('userId', user.id)
    if (!profile) {
      profile = await CandidateProfile.create({ userId: user.id })
    }
    profile.cvUrl = cvUrl
    if (payload.bio) profile.bio = payload.bio
    if (payload.skills) profile.skills = payload.skills
    await profile.save()

    const application = await Application.create({
      offerId: offer.id,
      userId: user.id,
      cvUrl,
      coverLetterUrl,
      coverLetterText: payload.coverLetterText || null,
      status: 'envoyee',
      appliedAt: DateTime.now(),
    })

    await ApplicationStatusService.recordInitial(application, user.id)

    await NotificationService.notifyStaff(
      'guest_application',
      `Nouvelle candidature (sans compte) de ${user!.fullName || user!.email} pour « ${offer.title} ».`
    )

    let activationUrl: string | null = null
    if (isNewAccount) {
      const token = AccountActivationService.createToken(user.id)
      const base = env.get('FRONTEND_URL') || 'http://localhost:3000'
      activationUrl = `${base.replace(/\/$/, '')}/activer-compte?token=${encodeURIComponent(token)}`
      void MailService.sendGuestApplicationEmail(user, offer.title, activationUrl)
    } else {
      void MailService.sendApplicationConfirmationEmail(user, offer.title)
    }

    void this.runAiAnalyze(application.id)

    return {
      data: {
        application,
        isNewAccount,
        message: isNewAccount
          ? 'Candidature envoyée. Vérifiez votre email pour activer le suivi de votre dossier.'
          : 'Candidature envoyée. Connectez-vous pour suivre votre dossier.',
      },
    }
  }

  /**
   * Extraction CV publique — préremplissage formulaire uniquement.
   * Pas d’évaluation / scoring du candidat.
   */
  async extractCvPublic({ request, response }: HttpContext) {
    const cv = request.file('cv', { size: '5mb', extnames: ['pdf', 'doc', 'docx'] })
    if (!cv) return response.badRequest({ message: 'Fichier CV requis' })

    // Save temporarily under cv folder so DocumentReader can resolve the path
    const cvUrl = await StorageService.saveUpload(cv, 'cv')
    const read = await DocumentReaderService.readUpload(cvUrl)
    const text = read?.text || ''

    if (!text || text.length < 20) {
      return {
        data: {
          fullName: null,
          email: null,
          phone: null,
          bio: null,
          skills: [] as string[],
          cvUrl,
          warning: 'Impossible d’extraire le texte du CV. Complétez le formulaire manuellement.',
        },
      }
    }

    const extracted = await AiService.extractCv(text)
    return {
      data: {
        fullName: extracted.fullName || null,
        email: extracted.email || null,
        phone: extracted.phone || null,
        bio: extracted.bio || null,
        skills: extracted.skills || [],
        cvUrl,
      },
    }
  }

  async me({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const applications = await Application.query()
      .where('user_id', user.id)
      .preload('offer')
      .preload('interview')
      .orderBy('applied_at', 'desc')
    return { data: applications }
  }

  async index({ request }: HttpContext) {
    const offerId = request.input('offerId')
    const status = request.input('status')
    const query = Application.query()
      .preload('offer')
      .preload('user')
      .preload('interview')
      .orderBy('ai_match_score', 'desc')
      .orderBy('applied_at', 'desc')

    if (offerId) query.where('offer_id', offerId)
    if (status) query.where('status', status)

    return { data: await query }
  }

  async updateStatus({ params, request, response, auth }: HttpContext) {
    const application = await Application.find(params.id)
    if (!application) return response.notFound({ message: 'Candidature introuvable' })

    const previous = application.status
    const payload = await request.validateUsing(applicationStatusValidator)
    const actor = auth.getUserOrFail()
    try {
      await ApplicationStatusService.changeStatus(
        application,
        payload.status,
        actor,
        { force: payload.force }
      )
    } catch (error) {
      return response.badRequest({ message: (error as Error).message })
    }

    await application.load('offer')
    await application.load('user')
    void ActivityLogService.fromRequest(request, actor, {
      action: 'application.status_change',
      category: 'application',
      summary: `Statut candidature « ${application.offer?.title || '#' + application.id} » : ${APPLICATION_STATUS_LABELS[previous as ApplicationStatus] || previous} → ${APPLICATION_STATUS_LABELS[payload.status]}`,
      resourceType: 'application',
      resourceId: application.id,
      metadata: {
        from: previous,
        to: payload.status,
        candidate: application.user?.fullName || application.user?.email,
        offerTitle: application.offer?.title,
      },
    })

    return { data: application }
  }

  /**
   * Envoie un email récapitulatif (offre, statut, entretien…) aux candidats sélectionnés.
   */
  async notifySelected({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(notifyCandidatesValidator)
    const actor = auth.getUserOrFail()
    const applications = await Application.query()
      .whereIn('id', payload.applicationIds)
      .preload('user')
      .preload('offer')
      .preload('interview')

    if (!applications.length) {
      return response.notFound({ message: 'Aucune candidature trouvée' })
    }

    const offerTypeLabel = (type: string) => (type === 'stage' ? 'Stage' : 'Emploi')
    const modeLabel = (mode: string | null | undefined) => {
      if (mode === 'presentiel') return 'présentiel'
      if (mode === 'distanciel') return 'distanciel'
      return mode || null
    }

    const sent: { id: number; email: string }[] = []
    const failed: { id: number; reason: string }[] = []

    for (const application of applications) {
      const user = application.user
      const offer = application.offer
      if (!user?.email || !offer) {
        failed.push({ id: application.id, reason: 'Données incomplètes' })
        continue
      }

      try {
        const interview = application.interview
        await MailService.sendCandidateSelectionEmail({
          user,
          offerTitle: offer.title,
          offerType: offerTypeLabel(offer.type),
          offerLocation: offer.location || null,
          offerDeadline: offer.deadline ? offer.deadline.toFormat('dd/MM/yyyy') : null,
          statusLabel: APPLICATION_STATUS_LABELS[application.status as ApplicationStatus],
          appliedAt: application.appliedAt
            ? application.appliedAt.toFormat('dd/MM/yyyy HH:mm')
            : null,
          interviewScheduledAt: interview?.scheduledAt
            ? interview.scheduledAt.toFormat("dd/MM/yyyy 'à' HH:mm")
            : null,
          interviewMode: modeLabel(interview?.mode),
          interviewMeetingLink: interview?.meetingLink || null,
          interviewNotes: interview?.notes || null,
          customMessage: payload.message || null,
        })

        await NotificationService.notify(
          user.id,
          'rh_email',
          `L’équipe RH vous a envoyé un email concernant « ${offer.title} ». Consultez votre boîte mail.`
        )

        sent.push({ id: application.id, email: user.email })
      } catch (error) {
        failed.push({ id: application.id, reason: (error as Error).message })
      }
    }

    void ActivityLogService.fromRequest(request, actor, {
      action: 'application.notify_selected',
      category: 'application',
      summary: `Envoi d’email à ${sent.length} candidat(s) sélectionné(s)`,
      resourceType: 'application',
      metadata: {
        applicationIds: payload.applicationIds,
        sentCount: sent.length,
        failedCount: failed.length,
        hasCustomMessage: Boolean(payload.message?.trim()),
      },
    })

    return {
      data: {
        sentCount: sent.length,
        failedCount: failed.length,
        sent,
        failed,
        message:
          sent.length === 1
            ? `Email envoyé à ${sent[0].email}`
            : `${sent.length} email(s) envoyé(s)`,
      },
    }
  }

  async aiAnalyze({ params, response, auth, request }: HttpContext) {
    const application = await Application.find(params.id)
    if (!application) return response.notFound({ message: 'Candidature introuvable' })

    const forceRaw = request.input('force', false)
    const force =
      forceRaw === true || forceRaw === 'true' || forceRaw === 1 || forceRaw === '1'

    await application.load('offer')
    const criteriaInput = request.input('criteria')
    if (typeof criteriaInput === 'string' && application.offer) {
      application.offer.aiAnalysisCriteria = criteriaInput.trim() || null
      await application.offer.save()
    }

    const currentCriteria = (application.offer?.aiAnalysisCriteria || '').trim()
    const usedCriteria = (application.aiAnalysisData?.criteriaUsed || '').trim()
    const criteriaMatch = usedCriteria === currentCriteria

    const alreadyAnalyzed =
      application.aiMatchScore != null &&
      application.aiAnalyzedAt != null &&
      criteriaMatch

    if (!force && alreadyAnalyzed) {
      await application.load('user')
      return { data: application, cached: true }
    }

    await this.runAiAnalyze(application.id)
    await application.refresh()
    await application.load('user')
    await application.load('offer')

    const actor = auth.getUserOrFail()
    const name = application.user?.fullName || application.user?.email || 'candidat'
    await NotificationService.notify(
      actor.id,
      'ai_analysis_ready',
      `Analyse IA terminée pour ${name} — « ${application.offer?.title || 'offre'} » (score ${application.aiMatchScore ?? '—'}).`
    )

    void ActivityLogService.fromRequest(request, actor, {
      action: 'application.ai_analyze',
      category: 'application',
      summary: `Analyse IA de ${name} — « ${application.offer?.title || 'offre'} » (score ${application.aiMatchScore ?? '—'})`,
      resourceType: 'application',
      resourceId: application.id,
      metadata: {
        score: application.aiMatchScore,
        candidate: name,
        offerTitle: application.offer?.title,
      },
    })

    return { data: application, cached: false }
  }

  /**
   * Analyse + classe toutes les candidatures d'une offre (du plus fort au plus faible).
   * Lit CV PDF/DOCX, lettre, profil, et recherche web (optionnelle) sur le candidat.
   * Réutilise les analyses déjà en base sauf si force=true.
   */
  async aiRankOffer({ params, request, response, auth }: HttpContext) {
    const offer = await Offer.find(params.id)
    if (!offer) return response.notFound({ message: 'Offre introuvable' })

    const webSearchRaw = request.input('webSearch', true)
    const webSearch =
      webSearchRaw === true ||
      webSearchRaw === 'true' ||
      webSearchRaw === 1 ||
      webSearchRaw === '1'

    const forceRaw = request.input('force', false)
    const force =
      forceRaw === true || forceRaw === 'true' || forceRaw === 1 || forceRaw === '1'

    const criteriaInput = request.input('criteria')
    if (typeof criteriaInput === 'string') {
      offer.aiAnalysisCriteria = criteriaInput.trim() || null
      await offer.save()
    }

    const applications = await Application.query()
      .where('offer_id', offer.id)
      .preload('user')
      .preload('offer')
      .orderBy('applied_at', 'asc')

    if (!applications.length) {
      return {
        data: {
          offerId: offer.id,
          offerTitle: offer.title,
          overview:
            'Aucune candidature pour cette offre. Attendez des dossiers avant de lancer le classement.',
          recommendedCount: 0,
          webSearch,
          fromCache: true,
          analyzedNow: 0,
          ranked: [],
        },
      }
    }

    const rankedItems: {
      rank: number
      grade: ReturnType<typeof scoreToGrade>
      applicationId: number
      score: number
      summary: string
      strengths: string[]
      gaps: string[]
      recommendation: 'retenir' | 'a_envisager' | 'ecarter'
      documents: { label: string; ok: boolean; chars: number; images: number }[]
      webResearch: {
        provider: string
        summary: string
        sources: { title: string; url: string; snippet: string }[]
      } | null
      application: Application
      fromCache: boolean
    }[] = []

    let analyzedNow = 0

    for (const application of applications) {
      const currentCriteria = (offer.aiAnalysisCriteria || '').trim()
      const usedCriteria = (application.aiAnalysisData?.criteriaUsed || '').trim()
      const canReuse =
        !force &&
        application.aiMatchScore != null &&
        application.aiAnalyzedAt != null &&
        application.aiSummary &&
        usedCriteria === currentCriteria

      if (canReuse) {
        const cached = application.aiAnalysisData
        rankedItems.push({
          rank: 0,
          grade:
            (cached?.grade as ReturnType<typeof scoreToGrade>) ||
            scoreToGrade(application.aiMatchScore!),
          applicationId: application.id,
          score: application.aiMatchScore!,
          summary: application.aiSummary!,
          strengths: cached?.strengths || [],
          gaps: cached?.gaps || [],
          recommendation: cached?.recommendation || 'a_envisager',
          documents: cached?.documents || [],
          webResearch: cached?.webResearch || null,
          application,
          fromCache: true,
        })
        continue
      }

      const profile = await CandidateProfile.findBy('userId', application.userId)
      const dossier = await DocumentReaderService.readApplicationDossier({
        cvUrl: application.cvUrl || profile?.cvUrl,
        coverLetterUrl: application.coverLetterUrl,
        coverLetterText: application.coverLetterText,
        profileBio: profile?.bio,
        profileSkills: profile?.skills,
        profileExtracted: profile?.aiExtractedData,
      })

      let webResearch: (typeof rankedItems)[number]['webResearch'] = null
      let webText: string | undefined
      if (webSearch) {
        const research = await WebResearchService.researchPerson({
          fullName: application.user?.fullName,
          email: application.user?.email,
          skills: profile?.skills,
          offerTitle: offer.title,
        })
        webResearch = {
          provider: research.provider,
          summary: research.summary,
          sources: research.sources,
        }
        webText = research.summary
      }

      const result = await AiService.analyzeApplication(
        application,
        offer,
        dossier.dossierText,
        webText
      )

      const grade = scoreToGrade(result.score)
      application.aiMatchScore = result.score
      application.aiSummary = result.summary
      application.aiAnalyzedAt = DateTime.now()
      application.aiAnalysisData = {
        grade,
        strengths: result.strengths || [],
        gaps: result.gaps || [],
        recommendation: result.recommendation || 'a_envisager',
        criteriaUsed: (offer.aiAnalysisCriteria || '').trim() || null,
        documents: dossier.documents,
        webResearch,
      }
      await application.save()
      analyzedNow++

      rankedItems.push({
        rank: 0,
        grade,
        applicationId: application.id,
        score: result.score,
        summary: result.summary,
        strengths: result.strengths || [],
        gaps: result.gaps || [],
        recommendation: result.recommendation || 'a_envisager',
        documents: dossier.documents,
        webResearch,
        application,
        fromCache: false,
      })
    }

    rankedItems.sort((a, b) => b.score - a.score || a.applicationId - b.applicationId)
    rankedItems.forEach((item, index) => {
      item.rank = index + 1
    })

    const overview = await AiService.summarizeOfferRanking({
      offerTitle: offer.title,
      ranked: rankedItems.map((item) => ({
        name:
          item.application.user?.fullName ||
          item.application.user?.email ||
          `Candidature #${item.applicationId}`,
        grade: item.grade,
        score: item.score,
        summary: item.summary,
      })),
    })

    const recommendedCount = rankedItems.filter(
      (i) => i.recommendation === 'retenir' || i.grade === 'A' || i.grade === 'B'
    ).length

    const actor = auth.getUserOrFail()
    if (analyzedNow > 0) {
      await NotificationService.notify(
        actor.id,
        'ai_ranking_ready',
        `Classement IA prêt pour « ${offer.title} » — ${rankedItems.length} dossier(s), ${recommendedCount} prioritaire(s).`
      )

      void ActivityLogService.fromRequest(request, actor, {
        action: 'application.ai_rank',
        category: 'application',
        summary: `Classement IA pour « ${offer.title} » (${rankedItems.length} dossiers, ${analyzedNow} nouvelles analyses)`,
        resourceType: 'offer',
        resourceId: offer.id,
        metadata: {
          offerTitle: offer.title,
          count: rankedItems.length,
          analyzedNow,
          recommendedCount,
          webSearch,
        },
      })
    }

    return {
      data: {
        offerId: offer.id,
        offerTitle: offer.title,
        overview,
        recommendedCount,
        webSearch,
        fromCache: analyzedNow === 0,
        analyzedNow,
        ranked: rankedItems,
      },
    }
  }

  async extractCv({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const cv = request.file('cv', { size: '5mb', extnames: ['pdf', 'doc', 'docx'] })
    if (!cv) return response.badRequest({ message: 'Fichier CV requis' })

    const cvUrl = await StorageService.saveUpload(cv, 'cv')
    let profile = await CandidateProfile.findBy('userId', user.id)
    if (!profile) profile = await CandidateProfile.create({ userId: user.id })
    profile.cvUrl = cvUrl

    const read = await DocumentReaderService.readUpload(cvUrl)
    const text = read?.text || ''

    const extracted = text
      ? await AiService.extractCv(text)
      : { bio: null, skills: [], experiences: [], formations: [] }

    profile.aiExtractedData = extracted
    if (extracted.bio) profile.bio = extracted.bio
    if (extracted.skills?.length) profile.skills = extracted.skills.join(', ')
    await profile.save()

    return { data: profile }
  }

  private async runAiAnalyze(applicationId: number) {
    const application = await Application.find(applicationId)
    if (!application) return
    const offer = await Offer.find(application.offerId)
    if (!offer) return

    await application.load('user')
    const profile = await CandidateProfile.findBy('userId', application.userId)
    const dossier = await DocumentReaderService.readApplicationDossier({
      cvUrl: application.cvUrl || profile?.cvUrl,
      coverLetterUrl: application.coverLetterUrl,
      coverLetterText: application.coverLetterText,
      profileBio: profile?.bio,
      profileSkills: profile?.skills,
      profileExtracted: profile?.aiExtractedData,
    })

    const research = await WebResearchService.researchPerson({
      fullName: application.user?.fullName,
      email: application.user?.email,
      skills: profile?.skills,
      offerTitle: offer.title,
    })

    const result = await AiService.analyzeApplication(
      application,
      offer,
      dossier.dossierText,
      research.summary
    )
    const grade = scoreToGrade(result.score)
    application.aiMatchScore = result.score
    application.aiSummary = result.summary
    application.aiAnalyzedAt = DateTime.now()
    application.aiAnalysisData = {
      grade,
      strengths: result.strengths || [],
      gaps: result.gaps || [],
      recommendation: result.recommendation || 'a_envisager',
      criteriaUsed: (offer.aiAnalysisCriteria || '').trim() || null,
      documents: dossier.documents,
      webResearch: {
        provider: research.provider,
        summary: research.summary,
        sources: research.sources,
      },
    }
    await application.save()
  }
}
