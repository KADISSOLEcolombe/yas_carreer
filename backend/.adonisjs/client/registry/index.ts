/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'auth.register': {
    methods: ["POST"],
    pattern: '/api/auth/register',
    tokens: [{"old":"/api/auth/register","type":0,"val":"api","end":""},{"old":"/api/auth/register","type":0,"val":"auth","end":""},{"old":"/api/auth/register","type":0,"val":"register","end":""}],
    types: placeholder as Registry['auth.register']['types'],
  },
  'auth.login': {
    methods: ["POST"],
    pattern: '/api/auth/login',
    tokens: [{"old":"/api/auth/login","type":0,"val":"api","end":""},{"old":"/api/auth/login","type":0,"val":"auth","end":""},{"old":"/api/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.login']['types'],
  },
  'auth.activate_account': {
    methods: ["POST"],
    pattern: '/api/auth/activate-account',
    tokens: [{"old":"/api/auth/activate-account","type":0,"val":"api","end":""},{"old":"/api/auth/activate-account","type":0,"val":"auth","end":""},{"old":"/api/auth/activate-account","type":0,"val":"activate-account","end":""}],
    types: placeholder as Registry['auth.activate_account']['types'],
  },
  'auth.change_password': {
    methods: ["POST"],
    pattern: '/api/auth/change-password',
    tokens: [{"old":"/api/auth/change-password","type":0,"val":"api","end":""},{"old":"/api/auth/change-password","type":0,"val":"auth","end":""},{"old":"/api/auth/change-password","type":0,"val":"change-password","end":""}],
    types: placeholder as Registry['auth.change_password']['types'],
  },
  'auth.logout': {
    methods: ["POST"],
    pattern: '/api/auth/logout',
    tokens: [{"old":"/api/auth/logout","type":0,"val":"api","end":""},{"old":"/api/auth/logout","type":0,"val":"auth","end":""},{"old":"/api/auth/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['auth.logout']['types'],
  },
  'auth.me': {
    methods: ["GET","HEAD"],
    pattern: '/api/auth/me',
    tokens: [{"old":"/api/auth/me","type":0,"val":"api","end":""},{"old":"/api/auth/me","type":0,"val":"auth","end":""},{"old":"/api/auth/me","type":0,"val":"me","end":""}],
    types: placeholder as Registry['auth.me']['types'],
  },
  'auth.update_profile': {
    methods: ["PATCH"],
    pattern: '/api/auth/profile',
    tokens: [{"old":"/api/auth/profile","type":0,"val":"api","end":""},{"old":"/api/auth/profile","type":0,"val":"auth","end":""},{"old":"/api/auth/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['auth.update_profile']['types'],
  },
  'users.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/users',
    tokens: [{"old":"/api/users","type":0,"val":"api","end":""},{"old":"/api/users","type":0,"val":"users","end":""}],
    types: placeholder as Registry['users.index']['types'],
  },
  'users.store': {
    methods: ["POST"],
    pattern: '/api/users',
    tokens: [{"old":"/api/users","type":0,"val":"api","end":""},{"old":"/api/users","type":0,"val":"users","end":""}],
    types: placeholder as Registry['users.store']['types'],
  },
  'users.update_role': {
    methods: ["PATCH"],
    pattern: '/api/users/:id/role',
    tokens: [{"old":"/api/users/:id/role","type":0,"val":"api","end":""},{"old":"/api/users/:id/role","type":0,"val":"users","end":""},{"old":"/api/users/:id/role","type":1,"val":"id","end":""},{"old":"/api/users/:id/role","type":0,"val":"role","end":""}],
    types: placeholder as Registry['users.update_role']['types'],
  },
  'users.update_status': {
    methods: ["PATCH"],
    pattern: '/api/users/:id/status',
    tokens: [{"old":"/api/users/:id/status","type":0,"val":"api","end":""},{"old":"/api/users/:id/status","type":0,"val":"users","end":""},{"old":"/api/users/:id/status","type":1,"val":"id","end":""},{"old":"/api/users/:id/status","type":0,"val":"status","end":""}],
    types: placeholder as Registry['users.update_status']['types'],
  },
  'offers.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/offers',
    tokens: [{"old":"/api/offers","type":0,"val":"api","end":""},{"old":"/api/offers","type":0,"val":"offers","end":""}],
    types: placeholder as Registry['offers.index']['types'],
  },
  'offers.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/offers/:id',
    tokens: [{"old":"/api/offers/:id","type":0,"val":"api","end":""},{"old":"/api/offers/:id","type":0,"val":"offers","end":""},{"old":"/api/offers/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['offers.show']['types'],
  },
  'offers.ai_assist': {
    methods: ["POST"],
    pattern: '/api/offers/ai-assist',
    tokens: [{"old":"/api/offers/ai-assist","type":0,"val":"api","end":""},{"old":"/api/offers/ai-assist","type":0,"val":"offers","end":""},{"old":"/api/offers/ai-assist","type":0,"val":"ai-assist","end":""}],
    types: placeholder as Registry['offers.ai_assist']['types'],
  },
  'offers.store': {
    methods: ["POST"],
    pattern: '/api/offers',
    tokens: [{"old":"/api/offers","type":0,"val":"api","end":""},{"old":"/api/offers","type":0,"val":"offers","end":""}],
    types: placeholder as Registry['offers.store']['types'],
  },
  'offers.update': {
    methods: ["PUT"],
    pattern: '/api/offers/:id',
    tokens: [{"old":"/api/offers/:id","type":0,"val":"api","end":""},{"old":"/api/offers/:id","type":0,"val":"offers","end":""},{"old":"/api/offers/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['offers.update']['types'],
  },
  'offers.update_ai_criteria': {
    methods: ["PATCH"],
    pattern: '/api/offers/:id/ai-criteria',
    tokens: [{"old":"/api/offers/:id/ai-criteria","type":0,"val":"api","end":""},{"old":"/api/offers/:id/ai-criteria","type":0,"val":"offers","end":""},{"old":"/api/offers/:id/ai-criteria","type":1,"val":"id","end":""},{"old":"/api/offers/:id/ai-criteria","type":0,"val":"ai-criteria","end":""}],
    types: placeholder as Registry['offers.update_ai_criteria']['types'],
  },
  'offers.destroy': {
    methods: ["DELETE"],
    pattern: '/api/offers/:id',
    tokens: [{"old":"/api/offers/:id","type":0,"val":"api","end":""},{"old":"/api/offers/:id","type":0,"val":"offers","end":""},{"old":"/api/offers/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['offers.destroy']['types'],
  },
  'applications.store': {
    methods: ["POST"],
    pattern: '/api/applications',
    tokens: [{"old":"/api/applications","type":0,"val":"api","end":""},{"old":"/api/applications","type":0,"val":"applications","end":""}],
    types: placeholder as Registry['applications.store']['types'],
  },
  'applications.me': {
    methods: ["GET","HEAD"],
    pattern: '/api/applications/me',
    tokens: [{"old":"/api/applications/me","type":0,"val":"api","end":""},{"old":"/api/applications/me","type":0,"val":"applications","end":""},{"old":"/api/applications/me","type":0,"val":"me","end":""}],
    types: placeholder as Registry['applications.me']['types'],
  },
  'applications.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/applications',
    tokens: [{"old":"/api/applications","type":0,"val":"api","end":""},{"old":"/api/applications","type":0,"val":"applications","end":""}],
    types: placeholder as Registry['applications.index']['types'],
  },
  'applications.notify_selected': {
    methods: ["POST"],
    pattern: '/api/applications/notify-selected',
    tokens: [{"old":"/api/applications/notify-selected","type":0,"val":"api","end":""},{"old":"/api/applications/notify-selected","type":0,"val":"applications","end":""},{"old":"/api/applications/notify-selected","type":0,"val":"notify-selected","end":""}],
    types: placeholder as Registry['applications.notify_selected']['types'],
  },
  'applications.update_status': {
    methods: ["PATCH"],
    pattern: '/api/applications/:id/status',
    tokens: [{"old":"/api/applications/:id/status","type":0,"val":"api","end":""},{"old":"/api/applications/:id/status","type":0,"val":"applications","end":""},{"old":"/api/applications/:id/status","type":1,"val":"id","end":""},{"old":"/api/applications/:id/status","type":0,"val":"status","end":""}],
    types: placeholder as Registry['applications.update_status']['types'],
  },
  'applications.ai_analyze': {
    methods: ["POST"],
    pattern: '/api/applications/:id/ai-analyze',
    tokens: [{"old":"/api/applications/:id/ai-analyze","type":0,"val":"api","end":""},{"old":"/api/applications/:id/ai-analyze","type":0,"val":"applications","end":""},{"old":"/api/applications/:id/ai-analyze","type":1,"val":"id","end":""},{"old":"/api/applications/:id/ai-analyze","type":0,"val":"ai-analyze","end":""}],
    types: placeholder as Registry['applications.ai_analyze']['types'],
  },
  'applications.ai_rank_offer': {
    methods: ["POST"],
    pattern: '/api/offers/:id/ai-rank',
    tokens: [{"old":"/api/offers/:id/ai-rank","type":0,"val":"api","end":""},{"old":"/api/offers/:id/ai-rank","type":0,"val":"offers","end":""},{"old":"/api/offers/:id/ai-rank","type":1,"val":"id","end":""},{"old":"/api/offers/:id/ai-rank","type":0,"val":"ai-rank","end":""}],
    types: placeholder as Registry['applications.ai_rank_offer']['types'],
  },
  'applications.extract_cv': {
    methods: ["POST"],
    pattern: '/api/candidate-profiles/ai-extract-cv',
    tokens: [{"old":"/api/candidate-profiles/ai-extract-cv","type":0,"val":"api","end":""},{"old":"/api/candidate-profiles/ai-extract-cv","type":0,"val":"candidate-profiles","end":""},{"old":"/api/candidate-profiles/ai-extract-cv","type":0,"val":"ai-extract-cv","end":""}],
    types: placeholder as Registry['applications.extract_cv']['types'],
  },
  'interviews.store': {
    methods: ["POST"],
    pattern: '/api/interviews',
    tokens: [{"old":"/api/interviews","type":0,"val":"api","end":""},{"old":"/api/interviews","type":0,"val":"interviews","end":""}],
    types: placeholder as Registry['interviews.store']['types'],
  },
  'interviews.me': {
    methods: ["GET","HEAD"],
    pattern: '/api/interviews/me',
    tokens: [{"old":"/api/interviews/me","type":0,"val":"api","end":""},{"old":"/api/interviews/me","type":0,"val":"interviews","end":""},{"old":"/api/interviews/me","type":0,"val":"me","end":""}],
    types: placeholder as Registry['interviews.me']['types'],
  },
  'interviews.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/interviews',
    tokens: [{"old":"/api/interviews","type":0,"val":"api","end":""},{"old":"/api/interviews","type":0,"val":"interviews","end":""}],
    types: placeholder as Registry['interviews.index']['types'],
  },
  'notifications.me': {
    methods: ["GET","HEAD"],
    pattern: '/api/notifications/me',
    tokens: [{"old":"/api/notifications/me","type":0,"val":"api","end":""},{"old":"/api/notifications/me","type":0,"val":"notifications","end":""},{"old":"/api/notifications/me","type":0,"val":"me","end":""}],
    types: placeholder as Registry['notifications.me']['types'],
  },
  'notifications.unread_count': {
    methods: ["GET","HEAD"],
    pattern: '/api/notifications/unread-count',
    tokens: [{"old":"/api/notifications/unread-count","type":0,"val":"api","end":""},{"old":"/api/notifications/unread-count","type":0,"val":"notifications","end":""},{"old":"/api/notifications/unread-count","type":0,"val":"unread-count","end":""}],
    types: placeholder as Registry['notifications.unread_count']['types'],
  },
  'notifications.mark_all_read': {
    methods: ["PATCH"],
    pattern: '/api/notifications/read-all',
    tokens: [{"old":"/api/notifications/read-all","type":0,"val":"api","end":""},{"old":"/api/notifications/read-all","type":0,"val":"notifications","end":""},{"old":"/api/notifications/read-all","type":0,"val":"read-all","end":""}],
    types: placeholder as Registry['notifications.mark_all_read']['types'],
  },
  'notifications.mark_read': {
    methods: ["PATCH"],
    pattern: '/api/notifications/:id/read',
    tokens: [{"old":"/api/notifications/:id/read","type":0,"val":"api","end":""},{"old":"/api/notifications/:id/read","type":0,"val":"notifications","end":""},{"old":"/api/notifications/:id/read","type":1,"val":"id","end":""},{"old":"/api/notifications/:id/read","type":0,"val":"read","end":""}],
    types: placeholder as Registry['notifications.mark_read']['types'],
  },
  'activity_logs.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/activity-logs',
    tokens: [{"old":"/api/activity-logs","type":0,"val":"api","end":""},{"old":"/api/activity-logs","type":0,"val":"activity-logs","end":""}],
    types: placeholder as Registry['activity_logs.index']['types'],
  },
  'activity_logs.summary': {
    methods: ["GET","HEAD"],
    pattern: '/api/activity-logs/summary',
    tokens: [{"old":"/api/activity-logs/summary","type":0,"val":"api","end":""},{"old":"/api/activity-logs/summary","type":0,"val":"activity-logs","end":""},{"old":"/api/activity-logs/summary","type":0,"val":"summary","end":""}],
    types: placeholder as Registry['activity_logs.summary']['types'],
  },
  'activity_logs.track': {
    methods: ["POST"],
    pattern: '/api/activity-logs/track',
    tokens: [{"old":"/api/activity-logs/track","type":0,"val":"api","end":""},{"old":"/api/activity-logs/track","type":0,"val":"activity-logs","end":""},{"old":"/api/activity-logs/track","type":0,"val":"track","end":""}],
    types: placeholder as Registry['activity_logs.track']['types'],
  },
  'dashboard.admin': {
    methods: ["GET","HEAD"],
    pattern: '/api/dashboard/admin',
    tokens: [{"old":"/api/dashboard/admin","type":0,"val":"api","end":""},{"old":"/api/dashboard/admin","type":0,"val":"dashboard","end":""},{"old":"/api/dashboard/admin","type":0,"val":"admin","end":""}],
    types: placeholder as Registry['dashboard.admin']['types'],
  },
  'dashboard.rh': {
    methods: ["GET","HEAD"],
    pattern: '/api/dashboard/rh',
    tokens: [{"old":"/api/dashboard/rh","type":0,"val":"api","end":""},{"old":"/api/dashboard/rh","type":0,"val":"dashboard","end":""},{"old":"/api/dashboard/rh","type":0,"val":"rh","end":""}],
    types: placeholder as Registry['dashboard.rh']['types'],
  },
  'dashboard.candidate': {
    methods: ["GET","HEAD"],
    pattern: '/api/dashboard/candidate',
    tokens: [{"old":"/api/dashboard/candidate","type":0,"val":"api","end":""},{"old":"/api/dashboard/candidate","type":0,"val":"dashboard","end":""},{"old":"/api/dashboard/candidate","type":0,"val":"candidate","end":""}],
    types: placeholder as Registry['dashboard.candidate']['types'],
  },
  'chatbot.message': {
    methods: ["POST"],
    pattern: '/api/chatbot/message',
    tokens: [{"old":"/api/chatbot/message","type":0,"val":"api","end":""},{"old":"/api/chatbot/message","type":0,"val":"chatbot","end":""},{"old":"/api/chatbot/message","type":0,"val":"message","end":""}],
    types: placeholder as Registry['chatbot.message']['types'],
  },
  'new_account.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/signup',
    tokens: [{"old":"/api/v1/auth/signup","type":0,"val":"api","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.store']['types'],
  },
  'access_tokens.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login',
    tokens: [{"old":"/api/v1/auth/login","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['access_tokens.store']['types'],
  },
  'profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/profile',
    tokens: [{"old":"/api/v1/account/profile","type":0,"val":"api","end":""},{"old":"/api/v1/account/profile","type":0,"val":"v1","end":""},{"old":"/api/v1/account/profile","type":0,"val":"account","end":""},{"old":"/api/v1/account/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['profile.show']['types'],
  },
  'access_tokens.destroy': {
    methods: ["POST"],
    pattern: '/api/v1/account/logout',
    tokens: [{"old":"/api/v1/account/logout","type":0,"val":"api","end":""},{"old":"/api/v1/account/logout","type":0,"val":"v1","end":""},{"old":"/api/v1/account/logout","type":0,"val":"account","end":""},{"old":"/api/v1/account/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['access_tokens.destroy']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
