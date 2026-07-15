'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SuperviseurLoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers la page de login unique
    router.replace('/login');
  }, [router]);

  return null;
}
