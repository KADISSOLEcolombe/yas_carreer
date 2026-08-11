/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import app from '@adonisjs/core/services/app'

router.get('/', () => {
  return {
    name: 'YasCareer API',
    version: '1.0.0',
  }
})

router.get('/uploads/*', async ({ params, response }) => {
  const relative = Array.isArray(params['*']) ? params['*'].join('/') : params['*']
  const absolute = join(app.makePath('storage', 'uploads'), relative)
  try {
    const data = await readFile(absolute)
    return response.send(data)
  } catch {
    return response.notFound({ message: 'Fichier introuvable' })
  }
})

router
  .group(() => {
    // Auth
    router.post('auth/register', [controllers.Auth, 'register'])
    router.post('auth/login', [controllers.Auth, 'login'])
    router.post('auth/activate-account', [controllers.Auth, 'activateAccount'])
    router
      .post('auth/change-password', [controllers.Auth, 'changePassword'])
      .use(middleware.auth())
    router
      .post('auth/logout', [controllers.Auth, 'logout'])
      .use(middleware.auth())
    router.get('auth/me', [controllers.Auth, 'me']).use(middleware.auth())
    router
      .patch('auth/profile', [controllers.Auth, 'updateProfile'])
      .use(middleware.auth())

    // Users (admin)
    router
      .group(() => {
        router.get('/', [controllers.Users, 'index'])
        router.post('/', [controllers.Users, 'store'])
        router.patch('/:id/role', [controllers.Users, 'updateRole'])
        router.patch('/:id/status', [controllers.Users, 'updateStatus'])
      })
      .prefix('users')
      .use([middleware.auth(), middleware.role({ roles: ['admin'] })])

    // Offers
    router.get('offers', [controllers.Offers, 'index']).use(middleware.silentAuth())
    router.get('offers/:id', [controllers.Offers, 'show']).use(middleware.silentAuth())
    router
      .post('offers/ai-assist', [controllers.Offers, 'aiAssist'])
      .use([middleware.auth(), middleware.role({ roles: ['rh', 'admin'] })])
    router
      .post('offers', [controllers.Offers, 'store'])
      .use([middleware.auth(), middleware.role({ roles: ['rh', 'admin'] })])
    router
      .put('offers/:id', [controllers.Offers, 'update'])
      .use([middleware.auth(), middleware.role({ roles: ['rh', 'admin'] })])
    router
      .patch('offers/:id/ai-criteria', [controllers.Offers, 'updateAiCriteria'])
      .use([middleware.auth(), middleware.role({ roles: ['rh', 'admin'] })])
    router
      .delete('offers/:id', [controllers.Offers, 'destroy'])
      .use([middleware.auth(), middleware.role({ roles: ['rh', 'admin'] })])

    // Applications
    router
      .post('applications', [controllers.Applications, 'store'])
      .use([middleware.auth(), middleware.role({ roles: ['candidat'] })])
    router
      .get('applications/me', [controllers.Applications, 'me'])
      .use([middleware.auth(), middleware.role({ roles: ['candidat'] })])
    router
      .get('applications', [controllers.Applications, 'index'])
      .use([middleware.auth(), middleware.role({ roles: ['rh', 'admin'] })])
    router
      .post('applications/notify-selected', [controllers.Applications, 'notifySelected'])
      .use([middleware.auth(), middleware.role({ roles: ['rh', 'admin'] })])
    router
      .patch('applications/:id/status', [controllers.Applications, 'updateStatus'])
      .use([middleware.auth(), middleware.role({ roles: ['rh', 'admin'] })])
    router
      .post('applications/:id/ai-analyze', [controllers.Applications, 'aiAnalyze'])
      .use([middleware.auth(), middleware.role({ roles: ['rh', 'admin'] })])
    router
      .post('offers/:id/ai-rank', [controllers.Applications, 'aiRankOffer'])
      .use([middleware.auth(), middleware.role({ roles: ['rh', 'admin'] })])
    router
      .post('candidate-profiles/ai-extract-cv', [controllers.Applications, 'extractCv'])
      .use([middleware.auth(), middleware.role({ roles: ['candidat'] })])

    // Interviews
    router
      .post('interviews', [controllers.Interviews, 'store'])
      .use([middleware.auth(), middleware.role({ roles: ['rh', 'admin'] })])
    router
      .get('interviews/me', [controllers.Interviews, 'me'])
      .use([middleware.auth(), middleware.role({ roles: ['candidat'] })])
    router
      .get('interviews', [controllers.Interviews, 'index'])
      .use([middleware.auth(), middleware.role({ roles: ['rh', 'admin'] })])

    // Notifications
    router.get('notifications/me', [controllers.Notifications, 'me']).use(middleware.auth())
    router
      .get('notifications/unread-count', [controllers.Notifications, 'unreadCount'])
      .use(middleware.auth())
    router
      .patch('notifications/read-all', [controllers.Notifications, 'markAllRead'])
      .use(middleware.auth())
    router
      .patch('notifications/:id/read', [controllers.Notifications, 'markRead'])
      .use(middleware.auth())

    // Activity logs (admin + track RH)
    router
      .get('activity-logs', [controllers.ActivityLogs, 'index'])
      .use([middleware.auth(), middleware.role({ roles: ['admin'] })])
    router
      .get('activity-logs/summary', [controllers.ActivityLogs, 'summary'])
      .use([middleware.auth(), middleware.role({ roles: ['admin'] })])
    router
      .post('activity-logs/track', [controllers.ActivityLogs, 'track'])
      .use([middleware.auth(), middleware.role({ roles: ['rh', 'admin'] })])

    // Dashboards
    router
      .get('dashboard/admin', [controllers.Dashboard, 'admin'])
      .use([middleware.auth(), middleware.role({ roles: ['admin'] })])
    router
      .get('dashboard/rh', [controllers.Dashboard, 'rh'])
      .use([middleware.auth(), middleware.role({ roles: ['rh', 'admin'] })])
    router
      .get('dashboard/candidate', [controllers.Dashboard, 'candidate'])
      .use([middleware.auth(), middleware.role({ roles: ['candidat'] })])

    // Chatbot (public + auth)
    router.post('chatbot/message', [controllers.Chatbot, 'message']).use(middleware.silentAuth())
  })
  .prefix('/api')

// Keep starter kit routes for compatibility
router
  .group(() => {
    router.post('auth/signup', [controllers.NewAccount, 'store'])
    router.post('auth/login', [controllers.AccessTokens, 'store'])
    router
      .group(() => {
        router.get('profile', [controllers.Profile, 'show'])
        router.post('logout', [controllers.AccessTokens, 'destroy'])
      })
      .prefix('account')
      .use(middleware.auth())
  })
  .prefix('/api/v1')
