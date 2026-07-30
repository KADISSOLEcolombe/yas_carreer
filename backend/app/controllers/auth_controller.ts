import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import User from '#models/user'
import CandidateProfile from '#models/candidate_profile'
import UserTransformer from '#transformers/user_transformer'
import {
  loginValidator,
  updateProfileValidator,
  activateAccountValidator,
  changePasswordValidator,
} from '#validators/yas'
import AccountActivationService from '#services/account_activation_service'
import NotificationService from '#services/notification_service'

export default class AuthController {
  /** Inscription publique désactivée — comptes candidats via candidature, RH via admin. */
  async register({ response }: HttpContext) {
    return response.gone({
      message:
        'L’inscription publique est désactivée. Postulez depuis une offre, ou contactez l’administrateur YasCareer pour un accès RH.',
    })
  }

  async login({ request, response, serialize }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const user = await User.verifyCredentials(email, password)

    if (!user.isActive) {
      return response.forbidden({ message: 'Compte désactivé' })
    }

    const token = await User.accessTokens.create(user)
    return serialize({
      user: UserTransformer.transform(user),
      token: token.value!.release(),
      mustChangePassword: Boolean(user.mustChangePassword),
    })
  }

  async logout({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    if (user.currentAccessToken) {
      await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    }
    return { message: 'Déconnexion réussie' }
  }

  async me({ auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    await user.load('profile')
    return serialize({
      user: UserTransformer.transform(user),
      profile: user.profile || null,
    })
  }

  async updateProfile({ auth, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(updateProfileValidator)

    if (payload.fullName !== undefined) user.fullName = payload.fullName
    if (payload.phone !== undefined) user.phone = payload.phone
    await user.save()

    let profile = await CandidateProfile.findBy('userId', user.id)
    if (!profile) {
      profile = await CandidateProfile.create({ userId: user.id })
    }
    if (payload.bio !== undefined) profile.bio = payload.bio
    if (payload.skills !== undefined) profile.skills = payload.skills
    await profile.save()

    return serialize({
      user: UserTransformer.transform(user),
      profile,
      updatedAt: DateTime.now().toISO(),
    })
  }

  /**
   * Change le mot de passe.
   * - Si mustChangePassword : pas besoin de l’ancien (1re connexion après invite).
   * - Sinon : currentPassword requis.
   */
  async changePassword({ auth, request, response, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(changePasswordValidator)

    if (!user.mustChangePassword) {
      if (!payload.currentPassword) {
        return response.badRequest({ message: 'Mot de passe actuel requis' })
      }
      const valid = await hash.verify(user.password, payload.currentPassword)
      if (!valid) {
        return response.badRequest({ message: 'Mot de passe actuel incorrect' })
      }
    }

    user.password = payload.password
    user.mustChangePassword = false
    await user.save()

    return serialize({
      user: UserTransformer.transform(user),
      message: 'Mot de passe mis à jour',
    })
  }

  /** Définit le mot de passe après candidature invitée (token email). */
  async activateAccount({ request, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(activateAccountValidator)
    const decoded = AccountActivationService.verifyToken(payload.token)
    if (!decoded) {
      return response.badRequest({ message: 'Lien d’activation invalide ou expiré' })
    }

    const user = await User.find(decoded.userId)
    if (!user || user.role !== 'candidat') {
      return response.notFound({ message: 'Compte introuvable' })
    }
    if (!user.isActive) {
      return response.forbidden({ message: 'Compte désactivé' })
    }

    user.password = payload.password
    user.mustChangePassword = false
    await user.save()

    await NotificationService.notify(
      user.id,
      'account_activated',
      'Votre espace YasCareer est activé. Vous pouvez suivre vos candidatures et entretiens.'
    )

    const token = await User.accessTokens.create(user)
    return serialize({
      user: UserTransformer.transform(user),
      token: token.value!.release(),
      message: 'Compte activé. Bienvenue sur YasCareer !',
    })
  }
}
