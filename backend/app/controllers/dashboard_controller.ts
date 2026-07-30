import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Offer from '#models/offer'
import Application from '#models/application'
import Interview from '#models/interview'
import { DateTime } from 'luxon'

export default class DashboardController {
  async admin({}: HttpContext) {
    const [users, rhCount, offers, applications, interviews] = await Promise.all([
      User.query().count('* as total'),
      User.query().where('role', 'rh').count('* as total'),
      Offer.query().count('* as total'),
      Application.query().count('* as total'),
      Interview.query().where('status', 'planifie').count('* as total'),
    ])

    const byStatus = await Application.query().select('status').count('* as total').groupBy('status')

    return {
      data: {
        usersTotal: Number(users[0].$extras.total),
        rhCount: Number(rhCount[0].$extras.total),
        offersTotal: Number(offers[0].$extras.total),
        applicationsTotal: Number(applications[0].$extras.total),
        interviewsUpcoming: Number(interviews[0].$extras.total),
        applicationsByStatus: byStatus.map((row) => ({
          status: row.status,
          total: Number(row.$extras.total),
        })),
      },
    }
  }

  async rh({}: HttpContext) {
    const [offers, published, applications, interviews] = await Promise.all([
      Offer.query().count('* as total'),
      Offer.query().where('status', 'publiee').count('* as total'),
      Application.query().count('* as total'),
      Interview.query()
        .where('status', 'planifie')
        .where('scheduled_at', '>=', DateTime.now().toSQL()!)
        .count('* as total'),
    ])

    const byStatus = await Application.query().select('status').count('* as total').groupBy('status')

    return {
      data: {
        offersTotal: Number(offers[0].$extras.total),
        offersPublished: Number(published[0].$extras.total),
        applicationsTotal: Number(applications[0].$extras.total),
        interviewsUpcoming: Number(interviews[0].$extras.total),
        applicationsByStatus: byStatus.map((row) => ({
          status: row.status,
          total: Number(row.$extras.total),
        })),
      },
    }
  }

  async candidate({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    const applications = await Application.query().where('user_id', user.id)
    const interviews = await Interview.query()
      .whereHas('application', (q) => q.where('user_id', user.id))
      .where('status', 'planifie')
      .where('scheduled_at', '>=', DateTime.now().toSQL()!)

    const byStatus: Record<string, number> = {}
    for (const a of applications) {
      byStatus[a.status] = (byStatus[a.status] || 0) + 1
    }

    return {
      data: {
        applicationsTotal: applications.length,
        applicationsByStatus: byStatus,
        interviewsUpcoming: interviews.length,
      },
    }
  }
}
