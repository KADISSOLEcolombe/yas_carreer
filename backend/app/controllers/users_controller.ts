import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import UserTransformer from '#transformers/user_transformer'
import { createUserValidator, updateRoleValidator, updateStatusValidator } from '#validators/yas'
import AccountActivationService from '#services/account_activation_service'
import MailService from '#services/mail_service'
import NotificationService from '#services/notification_service'
import ActivityLogService from '#services/activity_log_service'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrateur',
  rh: 'Ressources humaines',
}

export default class UsersController {
  async index({ request }: HttpContext) {
    const role = request.input('role')
    const query = User.query().orderBy('created_at', 'desc')
    if (role) query.where('role', role)
    const users = await query
    return {
      data: users.map((u) => UserTransformer.transform(u).toObject()),
    }
  }

  /**
   * Super-admin crée un compte RH (ou admin).
   * Mot de passe temporaire généré + email d’invitation ; changement obligatoire à la 1re connexion.
   */
  async store({ request, serialize, auth }: HttpContext) {
    const payload = await request.validateUsing(createUserValidator)
    const temporaryPassword =
      payload.password || AccountActivationService.randomPassword(14)

    const user = await User.create({
      fullName: payload.fullName,
      email: payload.email,
      password: temporaryPassword,
      role: payload.role,
      phone: payload.phone || null,
      isActive: true,
      mustChangePassword: true,
    })

    void MailService.sendStaffInviteEmail(
      user,
      temporaryPassword,
      ROLE_LABELS[user.role] || user.role
    )

    await NotificationService.notify(
      user.id,
      'account_activated',
      'Votre compte YasCareer a été créé. Connectez-vous avec l’email reçu, puis définissez votre mot de passe.'
    )

    const actor = auth.getUserOrFail()
    void ActivityLogService.fromRequest(request, actor, {
      action: 'user.create',
      category: 'user',
      summary: `Invitation ${ROLE_LABELS[user.role] || user.role} : ${user.fullName || user.email}`,
      resourceType: 'user',
      resourceId: user.id,
      metadata: { email: user.email, role: user.role },
    })

    return serialize({
      user: UserTransformer.transform(user),
      message: `Compte créé. Un email avec les accès a été envoyé à ${user.email}.`,
    })
  }

  async updateRole({ params, request, response, serialize, auth }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) return response.notFound({ message: 'Utilisateur introuvable' })
    const previous = user.role
    const { role } = await request.validateUsing(updateRoleValidator)
    if (role === 'candidat') {
      return response.badRequest({
        message: 'Les comptes candidats sont créés via les candidatures, pas par l’admin.',
      })
    }
    user.role = role
    await user.save()

    const actor = auth.getUserOrFail()
    void ActivityLogService.fromRequest(request, actor, {
      action: 'user.role_change',
      category: 'user',
      summary: `Changement de rôle pour ${user.fullName || user.email} : ${previous} → ${role}`,
      resourceType: 'user',
      resourceId: user.id,
      metadata: { from: previous, to: role, email: user.email },
    })

    return serialize({ user: UserTransformer.transform(user) })
  }

  async updateStatus({ params, request, response, serialize, auth }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) return response.notFound({ message: 'Utilisateur introuvable' })
    const { isActive } = await request.validateUsing(updateStatusValidator)
    user.isActive = isActive
    await user.save()

    const actor = auth.getUserOrFail()
    void ActivityLogService.fromRequest(request, actor, {
      action: 'user.status_change',
      category: 'user',
      summary: `${isActive ? 'Activation' : 'Désactivation'} du compte ${user.fullName || user.email}`,
      resourceType: 'user',
      resourceId: user.id,
      metadata: { isActive, email: user.email },
    })

    return serialize({ user: UserTransformer.transform(user) })
  }
}
