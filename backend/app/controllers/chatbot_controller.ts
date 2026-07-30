import type { HttpContext } from '@adonisjs/core/http'
import ChatbotMessage from '#models/chatbot_message'
import { chatbotValidator } from '#validators/yas'
import AiService from '#services/ai_service'

export default class ChatbotController {
  async message({ request, auth }: HttpContext) {
    const { message } = await request.validateUsing(chatbotValidator)
    const user = auth.user

    await ChatbotMessage.create({
      userId: user?.id || null,
      role: 'user',
      content: message,
    })

    const context = user
      ? `role=${user.role}; name=${user.fullName || user.email}`
      : 'visiteur non connecté'

    const reply = await AiService.chatbotReply(message, context)

    const assistant = await ChatbotMessage.create({
      userId: user?.id || null,
      role: 'assistant',
      content: reply,
    })

    return { data: { reply, messageId: assistant.id } }
  }
}
