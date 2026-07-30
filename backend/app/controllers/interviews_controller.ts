import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import Interview from '#models/interview'
import Application from '#models/application'
import { interviewValidator } from '#validators/yas'
import ApplicationStatusService from '#services/application_status_service'
import NotificationService from '#services/notification_service'
import MailService from '#services/mail_service'
import ActivityLogService from '#services/activity_log_service'

export default class InterviewsController {
  async store({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(interviewValidator)
    const application = await Application.query()
      .where('id', payload.applicationId)
      .preload('user')
      .preload('offer')
      .first()

    if (!application) return response.notFound({ message: 'Candidature introuvable' })

    const existing = await Interview.findBy('applicationId', application.id)
    const wasUpdate = Boolean(existing)
    if (existing) {
      existing.merge({
        scheduledAt: DateTime.fromISO(payload.scheduledAt),
        meetingLink: payload.meetingLink || null,
        mode: payload.mode,
        notes: payload.notes || null,
        status: 'planifie',
      })
      await existing.save()
    } else {
      await Interview.create({
        applicationId: application.id,
        scheduledAt: DateTime.fromISO(payload.scheduledAt),
        meetingLink: payload.meetingLink || null,
        mode: payload.mode,
        notes: payload.notes || null,
        status: 'planifie',
      })
    }

    if (application.status !== 'entretien_programme') {
      try {
        await ApplicationStatusService.changeStatus(
          application,
          'entretien_programme',
          auth.getUserOrFail(),
          { force: true, silent: true }
        )
      } catch {
        // ignore if already terminal without force path — force=true handles admin
      }
    }

    const when = DateTime.fromISO(payload.scheduledAt).toFormat("dd/LL/yyyy 'à' HH:mm")
    await NotificationService.notify(
      application.userId,
      'interview',
      `Entretien programmé pour « ${application.offer.title} » le ${when}${payload.mode === 'distanciel' ? ' (distanciel)' : ' (présentiel)'}.`
    )
    void MailService.sendInterviewEmail(
      application.user,
      application.offer.title,
      when,
      payload.meetingLink || null,
      payload.mode
    )

    const actor = auth.getUserOrFail()
    void ActivityLogService.fromRequest(request, actor, {
      action: wasUpdate ? 'interview.update' : 'interview.schedule',
      category: 'interview',
      summary: `${wasUpdate ? 'Mise à jour' : 'Programmation'} d’entretien pour « ${application.offer.title} » — ${when}`,
      resourceType: 'application',
      resourceId: application.id,
      metadata: {
        offerTitle: application.offer.title,
        candidate: application.user?.fullName || application.user?.email,
        scheduledAt: payload.scheduledAt,
        mode: payload.mode,
      },
    })

    const interview = await Interview.findByOrFail('applicationId', application.id)
    return { data: interview }
  }

  async me({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const interviews = await Interview.query()
      .whereHas('application', (q) => q.where('user_id', user.id))
      .preload('application', (q) => q.preload('offer'))
      .orderBy('scheduled_at', 'asc')
    return { data: interviews }
  }

  async index({}: HttpContext) {
    const interviews = await Interview.query()
      .preload('application', (q) => {
        q.preload('offer').preload('user')
      })
      .orderBy('scheduled_at', 'asc')
    return { data: interviews }
  }
}
