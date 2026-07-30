import { ChatbotMessageSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class ChatbotMessage extends ChatbotMessageSchema {
  static table = 'chatbot_messages'

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
