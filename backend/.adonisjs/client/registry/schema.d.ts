/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'auth.register': {
    methods: ["POST"]
    pattern: '/api/auth/register'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['register']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['register']>>>
    }
  }
  'auth.login': {
    methods: ["POST"]
    pattern: '/api/auth/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/yas').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/yas').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['login']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['login']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.activate_account': {
    methods: ["POST"]
    pattern: '/api/auth/activate-account'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/yas').activateAccountValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/yas').activateAccountValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['activateAccount']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['activateAccount']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.change_password': {
    methods: ["POST"]
    pattern: '/api/auth/change-password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/yas').changePasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/yas').changePasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['changePassword']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['changePassword']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.logout': {
    methods: ["POST"]
    pattern: '/api/auth/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['logout']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['logout']>>>
    }
  }
  'auth.me': {
    methods: ["GET","HEAD"]
    pattern: '/api/auth/me'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['me']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['me']>>>
    }
  }
  'auth.update_profile': {
    methods: ["PATCH"]
    pattern: '/api/auth/profile'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/yas').updateProfileValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/yas').updateProfileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['updateProfile']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['updateProfile']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'users.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/users'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users_controller').default['index']>>>
    }
  }
  'users.store': {
    methods: ["POST"]
    pattern: '/api/users'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/yas').createUserValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/yas').createUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'users.update_role': {
    methods: ["PATCH"]
    pattern: '/api/users/:id/role'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/yas').updateRoleValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/yas').updateRoleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users_controller').default['updateRole']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users_controller').default['updateRole']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'users.update_status': {
    methods: ["PATCH"]
    pattern: '/api/users/:id/status'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/yas').updateStatusValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/yas').updateStatusValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users_controller').default['updateStatus']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users_controller').default['updateStatus']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'offers.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/offers'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/offers_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/offers_controller').default['index']>>>
    }
  }
  'offers.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/offers/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/offers_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/offers_controller').default['show']>>>
    }
  }
  'offers.ai_assist': {
    methods: ["POST"]
    pattern: '/api/offers/ai-assist'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/yas').offerAssistValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/yas').offerAssistValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/offers_controller').default['aiAssist']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/offers_controller').default['aiAssist']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'offers.store': {
    methods: ["POST"]
    pattern: '/api/offers'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/yas').offerValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/yas').offerValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/offers_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/offers_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'offers.update': {
    methods: ["PUT"]
    pattern: '/api/offers/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/yas').offerValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/yas').offerValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/offers_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/offers_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'offers.update_ai_criteria': {
    methods: ["PATCH"]
    pattern: '/api/offers/:id/ai-criteria'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/offers_controller').default['updateAiCriteria']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/offers_controller').default['updateAiCriteria']>>>
    }
  }
  'offers.destroy': {
    methods: ["DELETE"]
    pattern: '/api/offers/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/offers_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/offers_controller').default['destroy']>>>
    }
  }
  'applications.guest_store': {
    methods: ["POST"]
    pattern: '/api/applications/guest'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/yas').guestApplicationValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/yas').guestApplicationValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/applications_controller').default['guestStore']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/applications_controller').default['guestStore']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'applications.extract_cv_public': {
    methods: ["POST"]
    pattern: '/api/applications/extract-cv-public'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/applications_controller').default['extractCvPublic']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/applications_controller').default['extractCvPublic']>>>
    }
  }
  'applications.store': {
    methods: ["POST"]
    pattern: '/api/applications'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/yas').applicationStoreValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/yas').applicationStoreValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/applications_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/applications_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'applications.me': {
    methods: ["GET","HEAD"]
    pattern: '/api/applications/me'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/applications_controller').default['me']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/applications_controller').default['me']>>>
    }
  }
  'applications.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/applications'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/applications_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/applications_controller').default['index']>>>
    }
  }
  'applications.notify_selected': {
    methods: ["POST"]
    pattern: '/api/applications/notify-selected'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/yas').notifyCandidatesValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/yas').notifyCandidatesValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/applications_controller').default['notifySelected']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/applications_controller').default['notifySelected']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'applications.update_status': {
    methods: ["PATCH"]
    pattern: '/api/applications/:id/status'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/yas').applicationStatusValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/yas').applicationStatusValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/applications_controller').default['updateStatus']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/applications_controller').default['updateStatus']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'applications.ai_analyze': {
    methods: ["POST"]
    pattern: '/api/applications/:id/ai-analyze'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/applications_controller').default['aiAnalyze']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/applications_controller').default['aiAnalyze']>>>
    }
  }
  'applications.ai_rank_offer': {
    methods: ["POST"]
    pattern: '/api/offers/:id/ai-rank'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/applications_controller').default['aiRankOffer']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/applications_controller').default['aiRankOffer']>>>
    }
  }
  'applications.extract_cv': {
    methods: ["POST"]
    pattern: '/api/candidate-profiles/ai-extract-cv'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/applications_controller').default['extractCv']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/applications_controller').default['extractCv']>>>
    }
  }
  'interviews.store': {
    methods: ["POST"]
    pattern: '/api/interviews'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/yas').interviewValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/yas').interviewValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/interviews_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/interviews_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'interviews.me': {
    methods: ["GET","HEAD"]
    pattern: '/api/interviews/me'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/interviews_controller').default['me']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/interviews_controller').default['me']>>>
    }
  }
  'interviews.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/interviews'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/interviews_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/interviews_controller').default['index']>>>
    }
  }
  'notifications.me': {
    methods: ["GET","HEAD"]
    pattern: '/api/notifications/me'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['me']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['me']>>>
    }
  }
  'notifications.unread_count': {
    methods: ["GET","HEAD"]
    pattern: '/api/notifications/unread-count'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['unreadCount']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['unreadCount']>>>
    }
  }
  'notifications.mark_all_read': {
    methods: ["PATCH"]
    pattern: '/api/notifications/read-all'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['markAllRead']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['markAllRead']>>>
    }
  }
  'notifications.mark_read': {
    methods: ["PATCH"]
    pattern: '/api/notifications/:id/read'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['markRead']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['markRead']>>>
    }
  }
  'activity_logs.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/activity-logs'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/activity_logs_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/activity_logs_controller').default['index']>>>
    }
  }
  'activity_logs.summary': {
    methods: ["GET","HEAD"]
    pattern: '/api/activity-logs/summary'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/activity_logs_controller').default['summary']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/activity_logs_controller').default['summary']>>>
    }
  }
  'activity_logs.track': {
    methods: ["POST"]
    pattern: '/api/activity-logs/track'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/activity_logs_controller').default['track']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/activity_logs_controller').default['track']>>>
    }
  }
  'dashboard.admin': {
    methods: ["GET","HEAD"]
    pattern: '/api/dashboard/admin'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['admin']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['admin']>>>
    }
  }
  'dashboard.rh': {
    methods: ["GET","HEAD"]
    pattern: '/api/dashboard/rh'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['rh']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['rh']>>>
    }
  }
  'dashboard.candidate': {
    methods: ["GET","HEAD"]
    pattern: '/api/dashboard/candidate'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['candidate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['candidate']>>>
    }
  }
  'chatbot.message': {
    methods: ["POST"]
    pattern: '/api/chatbot/message'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/yas').chatbotValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/yas').chatbotValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/chatbot_controller').default['message']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/chatbot_controller').default['message']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'new_account.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/signup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').signupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').signupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'access_tokens.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'profile.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
    }
  }
  'access_tokens.destroy': {
    methods: ["POST"]
    pattern: '/api/v1/account/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['destroy']>>>
    }
  }
}
