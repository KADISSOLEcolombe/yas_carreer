'use client';

import Link from 'next/link';
import { Shield } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/** Page legacy remplacée par la gestion des comptes API. */
export default function AdminRolesPage() {
  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yas-midnight">
          <Shield size={20} />
          Rôles & comptes
        </CardTitle>
        <CardDescription>
          La gestion des rôles via localStorage a été retirée. Créez et gérez les comptes RH,
          superviseurs et admin depuis la page Utilisateurs (API réelle).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/admin/accounts" className={cn(buttonVariants(), 'font-semibold')}>
          Aller aux utilisateurs
        </Link>
      </CardContent>
    </Card>
  );
}
