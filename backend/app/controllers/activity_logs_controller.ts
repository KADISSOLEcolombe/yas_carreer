import type { HttpContext } from '@adonisjs/core/http'
import ActivityLog from '#models/activity_log'
import User from '#models/user'
import ActivityLogService from '#services/activity_log_service'
import vine from '@vinejs/vine'

const trackValidator = vine.create({
  action: vine.string().trim().minLength(2).maxLength(80),
  category: vine.string().trim().maxLength(40).optional(),
  summary: vine.string().trim().minLength(2).maxLength(500),
  resourceType: vine.string().trim().maxLength(60).optional(),
  resourceId: vine.number().withoutDecimals().optional(),
  metadata: vine.any().optional(),
})

export default class ActivityLogsController {
  /** Liste des activités (admin) — filtre par RH, catégorie, recherche. */
  async index({ request, response, auth }: HttpContext) {
    const actor = auth.getUserOrFail()
    if (actor.role !== 'admin') {
      return response.forbidden({ message: 'Réservé au super-administrateur' })
    }

    const userId = request.input('userId')
    const category = request.input('category')
    const action = request.input('action')
    const q = request.input('q')
    const limit = Math.min(Number(request.input('limit') || 100), 300)

    const query = ActivityLog.query()
      .preload('user')
      .orderBy('created_at', 'desc')
      .limit(limit)

    if (userId) query.where('user_id', Number(userId))
    if (category) query.where('category', String(category))
    if (action) query.where('action', String(action))
    if (q) {
      const term = `%${String(q).toLowerCase()}%`
      query.whereRaw('LOWER(summary) LIKE ?', [term])
    }

    query.whereHas('user', (uq) => {
      uq.whereIn('role', ['rh', 'admin'])
    })

    const logs = await query
    return { data: logs }
  }

  /** Résumé par RH pour le tableau de bord admin. */
  async summary({ response, auth }: HttpContext) {
    const actor = auth.getUserOrFail()
    if (actor.role !== 'admin') {
      return response.forbidden({ message: 'Réservé au super-administrateur' })
    }

    const staff = await User.query()
      .whereIn('role', ['rh', 'admin'])
      .where('is_active', true)
      .orderBy('full_name', 'asc')

    const rows = await Promise.all(
      staff.map(async (user) => {
        const total = await ActivityLog.query().where('user_id', user.id).count('* as total')
        const last = await ActivityLog.query()
          .where('user_id', user.id)
          .orderBy('created_at', 'desc')
          .first()
        return {
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
          },
          totalActions: Number(total[0].$extras.total || 0),
          lastActionAt: last?.createdAt?.toISO() || null,
          lastSummary: last?.summary || null,
        }
      })
    )

    return { data: rows }
  }

  /**
   * Trace UI côté client (clics / panels) pour RH & admin.
   * Complète les logs serveur des mutations métier.
   */
  async track(ctx: HttpContext) {
    const { request, auth } = ctx
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(trackValidator)

    await ActivityLogService.fromRequest(request, user, {
      action: payload.action.startsWith('ui.') ? payload.action : `ui.${payload.action}`,
      category: payload.category || 'ui',
      summary: payload.summary,
      resourceType: payload.resourceType || null,
      resourceId: payload.resourceId ?? null,
      metadata: (payload.metadata as Record<string, unknown>) || null,
    })

    return { data: { ok: true } }
  }
}
