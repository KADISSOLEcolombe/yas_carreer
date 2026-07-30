import { DateTime } from 'luxon'
import Notification from '#models/notification'
import User from '#models/user'

export type NotificationType =
  | 'new_application'
  | 'guest_application'
  | 'application_status'
  | 'interview'
  | 'rh_email'
  | 'offer_published'
  | 'ai_analysis_ready'
  | 'ai_ranking_ready'
  | 'account_activated'

export default class NotificationService {
  static async notify(userId: number, type: NotificationType | string, content: string) {
    return Notification.create({
      userId,
      type,
      content,
      readAt: null,
    })
  }

  /** Notifie tous les RH et admins actifs. */
  static async notifyStaff(type: NotificationType | string, content: string, exceptUserId?: number) {
    const query = User.query().whereIn('role', ['rh', 'admin']).where('is_active', true)
    if (exceptUserId) query.whereNot('id', exceptUserId)
    const staff = await query
    await Promise.all(staff.map((s) => this.notify(s.id, type, content)))
    return staff.length
  }

  static async markRead(notification: Notification) {
    notification.readAt = DateTime.now()
    await notification.save()
    return notification
  }

  static async markAllRead(userId: number) {
    const now = DateTime.now()
    await Notification.query()
      .where('user_id', userId)
      .whereNull('read_at')
      .update({ readAt: now })
  }

  static async unreadCount(userId: number) {
    const result = await Notification.query()
      .where('user_id', userId)
      .whereNull('read_at')
      .count('* as total')
    return Number(result[0].$extras.total || 0)
  }
}
