'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Identifiants invalides');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-muted/70 to-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Retour à l&apos;accueil
        </Link>

        <Card>
          <CardHeader className="text-center">
            <Link href="/" className="mb-2 inline-flex justify-center">
              <img src="/jm.svg" alt="YAS" className="h-12 w-auto" />
            </Link>
            <CardTitle className="text-2xl font-bold text-yas-midnight">Connexion</CardTitle>
            <CardDescription>Accédez à votre espace pour postuler aux offres</CardDescription>
          </CardHeader>

          <CardContent>
            {message === 'auth_required' && (
              <div className="mb-6 rounded-r-md border-l-4 border-yas-midnight bg-accent p-4">
                <h4 className="mb-1 font-semibold text-yas-midnight">Connexion requise</h4>
                <p className="text-sm text-muted-foreground">
                  Vous devez vous connecter pour accéder à cette page.
                </p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="h-11 pl-10"
                    placeholder="ex: nom@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="h-11 pl-10"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="h-11 w-full font-bold">
                {isSubmitting ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center border-t">
            <p className="text-sm text-muted-foreground">
              Vous n&apos;avez pas de compte ?
              <Link href="/register" className="ml-1 font-medium text-yas-midnight hover:underline">
                Créer un compte
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
