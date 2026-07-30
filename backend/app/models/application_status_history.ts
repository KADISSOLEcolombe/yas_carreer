import { ApplicationStatusHistorySchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Application from '#models/application'
import User from '#models/user'

export default class ApplicationStatusHistory extends ApplicationStatusHistorySchema {
  static table = 'application_status_histories'

  @belongsTo(() => Application)
  declare application: BelongsTo<typeof Application>

  @belongsTo(() => User, { foreignKey: 'changedBy' })
  declare changer: BelongsTo<typeof User>
}
