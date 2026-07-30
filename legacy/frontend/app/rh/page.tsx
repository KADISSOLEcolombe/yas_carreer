'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function RHPage() {
  const router = useRouter();
  const { isAuthenticated, isRecruiter, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && isRecruiter) {
      router.replace('/rh/dashboard');
    } else {
      router.replace('/rh/login');
    }
  }, [isLoading, isAuthenticated, isRecruiter, router]);

  return null;
}
