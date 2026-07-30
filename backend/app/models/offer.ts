import { OfferSchema } from '#database/schema'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Application from '#models/application'

export default class Offer extends OfferSchema {
  static table = 'offers'

  @belongsTo(() => User, { foreignKey: 'createdBy' })
  declare creator: BelongsTo<typeof User>

  @hasMany(() => Application)
  declare applications: HasMany<typeof Application>
}
