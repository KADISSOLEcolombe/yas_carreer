import { InterviewSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Application from '#models/application'

export default class Interview extends InterviewSchema {
  static table = 'interviews'

  @belongsTo(() => Application)
  declare application: BelongsTo<typeof Application>
}
