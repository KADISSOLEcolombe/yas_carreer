import { ActivityLogSchema } from '#database/schema'
import { belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class ActivityLog extends ActivityLogSchema {
  static table = 'activity_logs'

  @column({
    prepare: (value: unknown) => (value == null ? null : JSON.stringify(value)),
    consume: (value: unknown) => {
      if (value == null || value === '') return null
      if (typeof value === 'object') return value
      try {
        return JSON.parse(String(value))
      } catch {
        return null
      }
    },
  })
  declare metadata: Record<string, unknown> | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
