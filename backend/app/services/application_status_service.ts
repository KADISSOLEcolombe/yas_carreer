import { DateTime } from 'luxon'
import Application from '#models/application'
import ApplicationStatusHistory from '#models/application_status_history'
import User from '#models/user'
import {
  APPLICATION_STATUS_LABELS,
  canTransitionStatus,
  type ApplicationStatus,
} from '#types/domain'
import NotificationService from '#services/notification_service'
import MailService from '#services/mail_service'

export default class ApplicationStatusService {
  static async changeStatus(
    application: Application,
    nextStatus: ApplicationStatus,
    changedBy: User,
    options: { force?: boolean; silent?: boolean } = {}
  ) {
    const current = application.status as ApplicationStatus
    if (!canTransitionStatus(current, nextStatus, options.force === true || changedBy.role === 'admin')) {
      throw new Error(`Transition invalide : ${current} → ${nextStatus}`)
    }

    application.status = nextStatus
    await application.save()

    await ApplicationStatusHistory.create({
      applicationId: application.id,
      status: nextStatus,
      changedBy: changedBy.id,
      changedAt: DateTime.now(),
    })

    if (options.silent) return

    await application.load('user')
    await application.load('offer')

    const label = APPLICATION_STATUS_LABELS[nextStatus]
    await NotificationService.notify(
      application.userId,
      'application_status',
      `Votre candidature pour « ${application.offer.title} » est maintenant : ${label}.`
    )

    void MailService.sendApplicationStatusEmail(application.user, application.offer.title, label)
  }

  static async recordInitial(application: Application, userId: number) {
    await ApplicationStatusHistory.create({
      applicationId: application.id,
      status: application.status,
      changedBy: userId,
      changedAt: DateTime.now(),
    })
  }
}
