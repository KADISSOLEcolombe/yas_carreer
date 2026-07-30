import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import Offer from '#models/offer'
import { offerValidator, offerAssistValidator, offerAiCriteriaValidator } from '#validators/yas'
import AiService from '#services/ai_service'
import NotificationService from '#services/notification_service'
import ActivityLogService from '#services/activity_log_service'

export default class OffersController {
  async index({ request, auth }: HttpContext) {
    const type = request.input('type')
    const location = request.input('location')
    const q = request.input('q')
    const status = request.input('status')

    const query = Offer.query().orderBy('created_at', 'desc')

    const user = auth.user
    if (!user || user.role === 'candidat') {
      query.where('status', 'publiee')
    } else if (status) {
      query.where('status', status)
    }

    if (type) query.where('type', type)
    if (location) {
      query.whereRaw('LOWER(location) LIKE ?', [`%${String(location).toLowerCase()}%`])
    }
    if (q) {
      const term = `%${String(q).toLowerCase()}%`
      query.where((builder) => {
        builder
          .whereRaw('LOWER(title) LIKE ?', [term])
          .orWhereRaw('LOWER(description) LIKE ?', [term])
          .orWhereRaw('LOWER(COALESCE(requirements, \"\")) LIKE ?', [term])
      })
    }

    const offers = await query
    return { data: offers }
  }

  async show({ params, response, auth }: HttpContext) {
    const offer = await Offer.find(params.id)
    if (!offer) return response.notFound({ message: 'Offre introuvable' })

    const user = auth.user
    if (offer.status !== 'publiee' && (!user || user.role === 'candidat')) {
      return response.notFound({ message: 'Offre introuvable' })
    }

    return { data: offer }
  }

  async store({ request, auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(offerValidator)

    const offer = await Offer.create({
      title: payload.title,
      type: payload.type,
      description: payload.description,
      requirements: payload.requirements || null,
      deadline: payload.deadline ? DateTime.fromISO(payload.deadline) : null,
      location: payload.location || null,
      status: payload.status || 'brouillon',
      createdBy: user.id,
      aiAnalysisCriteria: payload.aiAnalysisCriteria?.trim() || null,
    })

    if (offer.status === 'publiee') {
      await NotificationService.notifyStaff(
        'offer_published',
        `Offre publiée : « ${offer.title} »${offer.location ? ` — ${offer.location}` : ''}.`,
        user.id
      )
    }

    void ActivityLogService.fromRequest(request, user, {
      action: 'offer.create',
      category: 'offer',
      summary: `Création de l’offre « ${offer.title} » (${offer.status})`,
      resourceType: 'offer',
      resourceId: offer.id,
      metadata: { title: offer.title, status: offer.status, type: offer.type },
    })

    return { data: offer }
  }

  async update({ params, request, response, auth }: HttpContext) {
    const offer = await Offer.find(params.id)
    if (!offer) return response.notFound({ message: 'Offre introuvable' })

    const wasPublished = offer.status === 'publiee'
    const payload = await request.validateUsing(offerValidator)
    offer.merge({
      title: payload.title,
      type: payload.type,
      description: payload.description,
      requirements: payload.requirements || null,
      deadline: payload.deadline ? DateTime.fromISO(payload.deadline) : null,
      location: payload.location || null,
      status: payload.status || offer.status,
      ...(payload.aiAnalysisCriteria !== undefined
        ? { aiAnalysisCriteria: payload.aiAnalysisCriteria?.trim() || null }
        : {}),
    })
    await offer.save()

    if (!wasPublished && offer.status === 'publiee') {
      const actor = auth.getUserOrFail()
      await NotificationService.notifyStaff(
        'offer_published',
        `Offre publiée : « ${offer.title} »${offer.location ? ` — ${offer.location}` : ''}.`,
        actor.id
      )
      await NotificationService.notify(
        actor.id,
        'offer_published',
        `Votre offre « ${offer.title} » est maintenant en ligne.`
      )
    }

    const actor = auth.getUserOrFail()
    void ActivityLogService.fromRequest(request, actor, {
      action: !wasPublished && offer.status === 'publiee' ? 'offer.publish' : 'offer.update',
      category: 'offer',
      summary:
        !wasPublished && offer.status === 'publiee'
          ? `Publication de l’offre « ${offer.title} »`
          : `Modification de l’offre « ${offer.title} »`,
      resourceType: 'offer',
      resourceId: offer.id,
      metadata: { title: offer.title, status: offer.status, type: offer.type },
    })

    return { data: offer }
  }

  /** Met à jour uniquement les critères d’analyse IA définis par le RH. */
  async updateAiCriteria({ params, request, response, auth }: HttpContext) {
    const offer = await Offer.find(params.id)
    if (!offer) return response.notFound({ message: 'Offre introuvable' })

    const payload = await request.validateUsing(offerAiCriteriaValidator)
    offer.aiAnalysisCriteria = payload.aiAnalysisCriteria?.trim() || null
    await offer.save()

    const actor = auth.getUserOrFail()
    void ActivityLogService.fromRequest(request, actor, {
      action: 'offer.ai_criteria',
      category: 'offer',
      summary: `Critères d’analyse IA mis à jour pour « ${offer.title} »`,
      resourceType: 'offer',
      resourceId: offer.id,
      metadata: {
        title: offer.title,
        criteriaLength: offer.aiAnalysisCriteria?.length || 0,
      },
    })

    return { data: offer }
  }

  async destroy({ params, response, auth, request }: HttpContext) {
    const offer = await Offer.find(params.id)
    if (!offer) return response.notFound({ message: 'Offre introuvable' })
    const title = offer.title
    const id = offer.id
    await offer.delete()

    const actor = auth.getUserOrFail()
    void ActivityLogService.fromRequest(request, actor, {
      action: 'offer.delete',
      category: 'offer',
      summary: `Suppression de l’offre « ${title} »`,
      resourceType: 'offer',
      resourceId: id,
      metadata: { title },
    })

    return { message: 'Offre supprimée' }
  }

  async aiAssist({ request, auth }: HttpContext) {
    const { brief, type } = await request.validateUsing(offerAssistValidator)
    const result = await AiService.assistOffer(brief, type)
    const user = auth.getUserOrFail()
    void ActivityLogService.fromRequest(request, user, {
      action: 'offer.ai_assist',
      category: 'offer',
      summary: `Assistance IA pour rédiger une offre (${type || 'auto'})`,
      resourceType: 'offer',
      metadata: { briefLength: brief.length, type: type || null },
    })
    return { data: result }
  }
}
