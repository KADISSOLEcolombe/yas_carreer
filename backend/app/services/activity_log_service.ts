import type { Request } from '@adonisjs/core/http'
import ActivityLog from '#models/activity_log'
import type User from '#models/user'

export type ActivityInput = {
  userId: number
  action: string
  category: string
  summary: string
  resourceType?: string | null
  resourceId?: number | null
  metadata?: Record<string, unknown> | null
  ipAddress?: string | null
  userAgent?: string | null
}

export default class ActivityLogService {
  static async record(input: ActivityInput) {
    return ActivityLog.create({
      userId: input.userId,
      action: input.action,
      category: input.category,
      summary: input.summary.slice(0, 500),
      resourceType: input.resourceType || null,
      resourceId: input.resourceId ?? null,
      metadata: input.metadata || null,
      ipAddress: input.ipAddress || null,
      userAgent: input.userAgent?.slice(0, 500) || null,
    })
  }

  /** Enregistre une action RH/admin depuis la requête HTTP. */
  static async fromRequest(
    request: Request,
    user: User,
    input: Omit<ActivityInput, 'userId' | 'ipAddress' | 'userAgent'>
  ) {
    if (user.role !== 'rh' && user.role !== 'admin') return null

    try {
      return await this.record({
        ...input,
        userId: user.id,
        ipAddress: request.ip(),
        userAgent: request.header('user-agent') || null,
      })
    } catch {
      return null
    }
  }
}
