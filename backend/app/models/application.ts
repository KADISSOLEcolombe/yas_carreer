import { ApplicationSchema } from '#database/schema'
import { belongsTo, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Offer from '#models/offer'
import ApplicationStatusHistory from '#models/application_status_history'
import Interview from '#models/interview'

export type ApplicationAiAnalysisData = {
  grade?: string
  strengths?: string[]
  gaps?: string[]
  recommendation?: 'retenir' | 'a_envisager' | 'ecarter'
  criteriaUsed?: string | null
  documents?: { label: string; ok: boolean; chars: number; images: number }[]
  webResearch?: {
    provider: string
    summary: string
    sources: { title: string; url: string; snippet: string }[]
  } | null
}

export default class Application extends ApplicationSchema {
  static table = 'applications'

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
  declare aiAnalysisData: ApplicationAiAnalysisData | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Offer)
  declare offer: BelongsTo<typeof Offer>

  @hasMany(() => ApplicationStatusHistory)
  declare statusHistory: HasMany<typeof ApplicationStatusHistory>

  @hasOne(() => Interview)
  declare interview: HasOne<typeof Interview>
}
