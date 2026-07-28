'use client';

import { usePathname } from 'next/navigation';
import RoleGuard from '../../components/RoleGuard';
import RHLayout from '../../components/RHLayout';

export default function RHRootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/rh/login') {
    return <>{children}</>;
  }

  return (
    <RoleGuard allowedRoles={['RH', 'ADMIN']} redirectTo="/rh/login">
      <RHLayout>{children}</RHLayout>
    </RoleGuard>
  );
}
