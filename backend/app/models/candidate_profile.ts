import { CandidateProfileSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class CandidateProfile extends CandidateProfileSchema {
  static table = 'candidate_profiles'

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
