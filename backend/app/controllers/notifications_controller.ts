import type { HttpContext } from '@adonisjs/core/http'
import Notification from '#models/notification'
import NotificationService from '#services/notification_service'

export default class NotificationsController {
  async me({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const notifications = await Notification.query()
      .where('user_id', user.id)
      .orderBy('created_at', 'desc')
      .limit(80)
    return { data: notifications }
  }

  async unreadCount({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const count = await NotificationService.unreadCount(user.id)
    return { data: { count } }
  }

  async markRead({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const notification = await Notification.query()
      .where('id', params.id)
      .where('user_id', user.id)
      .first()
    if (!notification) return response.notFound({ message: 'Notification introuvable' })
    await NotificationService.markRead(notification)
    return { data: notification }
  }

  async markAllRead({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    await NotificationService.markAllRead(user.id)
    return { data: { message: 'Toutes les notifications ont été marquées comme lues' } }
  }
}
