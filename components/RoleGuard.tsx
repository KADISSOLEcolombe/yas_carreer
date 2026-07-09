'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, type UserRole } from '../context/AuthContext';
import { COLORS } from '../lib/constants';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  redirectTo: string;
  children: React.ReactNode;
}

export default function RoleGuard({ allowedRoles, redirectTo, children }: RoleGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }
    if (user && !allowedRoles.includes(user.role)) {
      if (user.role === 'RECRUITER' || user.role === 'ADMIN') {
        router.push('/rh/dashboard');
      } else if (user.role === 'SUPERVISOR') {
        router.push('/superviseur/dashboard');
      } else {
        router.push('/profil');
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, redirectTo, router]);

  if (isLoading || !isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div
          className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2"
          style={{ borderColor: COLORS.midnight }}
        />
      </div>
    );
  }

  return <>{children}</>;
}
