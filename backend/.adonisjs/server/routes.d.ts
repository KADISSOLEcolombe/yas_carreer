import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.activate_account': { paramsTuple?: []; params?: {} }
    'auth.change_password': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'auth.me': { paramsTuple?: []; params?: {} }
    'auth.update_profile': { paramsTuple?: []; params?: {} }
    'users.index': { paramsTuple?: []; params?: {} }
    'users.store': { paramsTuple?: []; params?: {} }
    'users.update_role': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.index': { paramsTuple?: []; params?: {} }
    'offers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.ai_assist': { paramsTuple?: []; params?: {} }
    'offers.store': { paramsTuple?: []; params?: {} }
    'offers.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.update_ai_criteria': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'applications.store': { paramsTuple?: []; params?: {} }
    'applications.me': { paramsTuple?: []; params?: {} }
    'applications.index': { paramsTuple?: []; params?: {} }
    'applications.notify_selected': { paramsTuple?: []; params?: {} }
    'applications.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'applications.ai_analyze': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'applications.ai_rank_offer': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'applications.extract_cv': { paramsTuple?: []; params?: {} }
    'interviews.store': { paramsTuple?: []; params?: {} }
    'interviews.me': { paramsTuple?: []; params?: {} }
    'interviews.index': { paramsTuple?: []; params?: {} }
    'notifications.me': { paramsTuple?: []; params?: {} }
    'notifications.unread_count': { paramsTuple?: []; params?: {} }
    'notifications.mark_all_read': { paramsTuple?: []; params?: {} }
    'notifications.mark_read': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'activity_logs.index': { paramsTuple?: []; params?: {} }
    'activity_logs.summary': { paramsTuple?: []; params?: {} }
    'activity_logs.track': { paramsTuple?: []; params?: {} }
    'dashboard.admin': { paramsTuple?: []; params?: {} }
    'dashboard.rh': { paramsTuple?: []; params?: {} }
    'dashboard.candidate': { paramsTuple?: []; params?: {} }
    'chatbot.message': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'access_tokens.store': { paramsTuple?: []; params?: {} }
    'profile.show': { paramsTuple?: []; params?: {} }
    'access_tokens.destroy': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'auth.me': { paramsTuple?: []; params?: {} }
    'users.index': { paramsTuple?: []; params?: {} }
    'offers.index': { paramsTuple?: []; params?: {} }
    'offers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'applications.me': { paramsTuple?: []; params?: {} }
    'applications.index': { paramsTuple?: []; params?: {} }
    'interviews.me': { paramsTuple?: []; params?: {} }
    'interviews.index': { paramsTuple?: []; params?: {} }
    'notifications.me': { paramsTuple?: []; params?: {} }
    'notifications.unread_count': { paramsTuple?: []; params?: {} }
    'activity_logs.index': { paramsTuple?: []; params?: {} }
    'activity_logs.summary': { paramsTuple?: []; params?: {} }
    'dashboard.admin': { paramsTuple?: []; params?: {} }
    'dashboard.rh': { paramsTuple?: []; params?: {} }
    'dashboard.candidate': { paramsTuple?: []; params?: {} }
    'profile.show': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'auth.me': { paramsTuple?: []; params?: {} }
    'users.index': { paramsTuple?: []; params?: {} }
    'offers.index': { paramsTuple?: []; params?: {} }
    'offers.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'applications.me': { paramsTuple?: []; params?: {} }
    'applications.index': { paramsTuple?: []; params?: {} }
    'interviews.me': { paramsTuple?: []; params?: {} }
    'interviews.index': { paramsTuple?: []; params?: {} }
    'notifications.me': { paramsTuple?: []; params?: {} }
    'notifications.unread_count': { paramsTuple?: []; params?: {} }
    'activity_logs.index': { paramsTuple?: []; params?: {} }
    'activity_logs.summary': { paramsTuple?: []; params?: {} }
    'dashboard.admin': { paramsTuple?: []; params?: {} }
    'dashboard.rh': { paramsTuple?: []; params?: {} }
    'dashboard.candidate': { paramsTuple?: []; params?: {} }
    'profile.show': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'auth.register': { paramsTuple?: []; params?: {} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.activate_account': { paramsTuple?: []; params?: {} }
    'auth.change_password': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'users.store': { paramsTuple?: []; params?: {} }
    'offers.ai_assist': { paramsTuple?: []; params?: {} }
    'offers.store': { paramsTuple?: []; params?: {} }
    'applications.store': { paramsTuple?: []; params?: {} }
    'applications.notify_selected': { paramsTuple?: []; params?: {} }
    'applications.ai_analyze': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'applications.ai_rank_offer': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'applications.extract_cv': { paramsTuple?: []; params?: {} }
    'interviews.store': { paramsTuple?: []; params?: {} }
    'activity_logs.track': { paramsTuple?: []; params?: {} }
    'chatbot.message': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'access_tokens.store': { paramsTuple?: []; params?: {} }
    'access_tokens.destroy': { paramsTuple?: []; params?: {} }
  }
  PATCH: {
    'auth.update_profile': { paramsTuple?: []; params?: {} }
    'users.update_role': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'offers.update_ai_criteria': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'applications.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'notifications.mark_all_read': { paramsTuple?: []; params?: {} }
    'notifications.mark_read': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PUT: {
    'offers.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'offers.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}