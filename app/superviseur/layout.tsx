'use client';

import { usePathname } from 'next/navigation';
import RoleGuard from '../../components/RoleGuard';
import SuperviseurLayout from '../../components/superviseur/SuperviseurLayout';

export default function SuperviseurRootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/superviseur/login') {
    return <>{children}</>;
  }

  return (
    <RoleGuard allowedRoles={['SUPERVISOR']} redirectTo="/superviseur/login">
      <SuperviseurLayout>{children}</SuperviseurLayout>
    </RoleGuard>
  );
}
