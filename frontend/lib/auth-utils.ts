import type { UserRole } from './api';

export function isRhRole(role?: UserRole | null): boolean {
  return role === 'RECRUITER' || role === 'ADMIN';
}

export function isSupervisorRole(role?: UserRole | null): boolean {
  return role === 'SUPERVISOR';
}

export function getDefaultRoute(role?: UserRole | null): string {
  if (isSupervisorRole(role)) return '/superviseur/dashboard';
  if (isRhRole(role)) return '/rh';
  return '/profil';
}

export function canAccessRoute(role: UserRole | undefined, path: string): boolean {
  if (path.startsWith('/superviseur')) {
    return role === 'SUPERVISOR';
  }
  if (path.startsWith('/rh')) {
    return isRhRole(role);
  }
  if (path.startsWith('/profil')) {
    return role === 'CANDIDATE' || !role;
  }
  return true;
}

export function getPostLoginRoute(role: UserRole, redirect?: string | null): string {
  const target = redirect && redirect !== '/' ? redirect : getDefaultRoute(role);

  if (target.startsWith('/superviseur') && !isSupervisorRole(role)) {
    return getDefaultRoute(role);
  }

  if (target.startsWith('/rh') && !isRhRole(role)) {
    return getDefaultRoute(role);
  }

  if (target.startsWith('/profil') && isRhRole(role)) {
    return '/rh';
  }

  return target;
}
