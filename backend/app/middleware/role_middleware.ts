import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { UserRole } from '#types/domain'

/**
 * Restricts access to users whose role is in the allowed list.
 * Admin always passes when 'rh' is allowed (super-user for recruitment).
 */
export default class RoleMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      roles: UserRole[]
    }
  ) {
    const user = ctx.auth.getUserOrFail()

    if (!user.isActive) {
      return ctx.response.forbidden({ message: 'Compte désactivé' })
    }

    const allowed = options.roles
    const role = user.role as UserRole

    if (allowed.includes(role)) {
      return next()
    }

    // Admin inherits RH permissions
    if (role === 'admin' && allowed.includes('rh')) {
      return next()
    }

    return ctx.response.forbidden({ message: 'Accès refusé pour ce rôle' })
  }
}
