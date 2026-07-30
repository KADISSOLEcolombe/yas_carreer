/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    register: typeof routes['auth.register']
    login: typeof routes['auth.login']
    activateAccount: typeof routes['auth.activate_account']
    changePassword: typeof routes['auth.change_password']
    logout: typeof routes['auth.logout']
    me: typeof routes['auth.me']
    updateProfile: typeof routes['auth.update_profile']
  }
  users: {
    index: typeof routes['users.index']
    store: typeof routes['users.store']
    updateRole: typeof routes['users.update_role']
    updateStatus: typeof routes['users.update_status']
  }
  offers: {
    index: typeof routes['offers.index']
    show: typeof routes['offers.show']
    aiAssist: typeof routes['offers.ai_assist']
    store: typeof routes['offers.store']
    update: typeof routes['offers.update']
    updateAiCriteria: typeof routes['offers.update_ai_criteria']
    destroy: typeof routes['offers.destroy']
  }
  applications: {
    guestStore: typeof routes['applications.guest_store']
    extractCvPublic: typeof routes['applications.extract_cv_public']
    store: typeof routes['applications.store']
    me: typeof routes['applications.me']
    index: typeof routes['applications.index']
    notifySelected: typeof routes['applications.notify_selected']
    updateStatus: typeof routes['applications.update_status']
    aiAnalyze: typeof routes['applications.ai_analyze']
    aiRankOffer: typeof routes['applications.ai_rank_offer']
    extractCv: typeof routes['applications.extract_cv']
  }
  interviews: {
    store: typeof routes['interviews.store']
    me: typeof routes['interviews.me']
    index: typeof routes['interviews.index']
  }
  notifications: {
    me: typeof routes['notifications.me']
    unreadCount: typeof routes['notifications.unread_count']
    markAllRead: typeof routes['notifications.mark_all_read']
    markRead: typeof routes['notifications.mark_read']
  }
  activityLogs: {
    index: typeof routes['activity_logs.index']
    summary: typeof routes['activity_logs.summary']
    track: typeof routes['activity_logs.track']
  }
  dashboard: {
    admin: typeof routes['dashboard.admin']
    rh: typeof routes['dashboard.rh']
    candidate: typeof routes['dashboard.candidate']
  }
  chatbot: {
    message: typeof routes['chatbot.message']
  }
  newAccount: {
    store: typeof routes['new_account.store']
  }
  accessTokens: {
    store: typeof routes['access_tokens.store']
    destroy: typeof routes['access_tokens.destroy']
  }
  profile: {
    show: typeof routes['profile.show']
  }
}
