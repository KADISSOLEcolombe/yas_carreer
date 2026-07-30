'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, Mail, User, Phone, MapPin, Eye, EyeOff } from 'lucide-react';
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
import { toast } from 'sonner';

export default function RegisterPage() {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telephone, setTelephone] = useState('');
  const [quartier, setQuartier] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/profil');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nom.trim()) {
      setError('Le nom est requis');
      return;
    }
    if (!email.trim()) {
      setError("L'email est requis");
      return;
    }
    if (!password) {
      setError('Le mot de passe est requis');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsSubmitting(true);

    try {
      await register(nom, email, password, prenom, telephone, quartier);
      toast.success('Compte créé — un e-mail de bienvenue vous a été envoyé');
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription");
      toast.error(err.message || "Erreur lors de l'inscription");
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
            <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-xl bg-yas-midnight text-white">
              <User size={28} />
            </div>
            <CardTitle className="text-2xl font-bold text-yas-midnight">Créer un compte</CardTitle>
            <CardDescription>
              Rejoignez YAS Togo et postulez aux offres qui vous correspondent
            </CardDescription>
          </CardHeader>

          <CardContent>
            {message === 'favoris_required' && (
              <div className="mb-6 rounded-r-md border-l-4 border-yas-midnight bg-accent p-4">
                <h4 className="mb-1 font-semibold text-yas-midnight">Créez votre compte</h4>
                <p className="text-sm text-muted-foreground">
                  Créez un compte candidat pour sauvegarder des offres en favoris.
                </p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="nom" className="mb-2 block text-sm font-medium">
                    Nom <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <User
                      size={18}
                      className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      id="nom"
                      required
                      className="h-11 pl-10"
                      placeholder="Votre nom"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="prenom" className="mb-2 block text-sm font-medium">
                    Prénom(s)
                  </label>
                  <div className="relative">
                    <User
                      size={18}
                      className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      id="prenom"
                      className="h-11 pl-10"
                      placeholder="Votre prénom"
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium">
                  Adresse email <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="email"
                    type="email"
                    required
                    className="h-11 pl-10"
                    placeholder="ex: jean.dupont@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="telephone" className="mb-2 block text-sm font-medium">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone
                      size={18}
                      className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      id="telephone"
                      type="tel"
                      className="h-11 pl-10"
                      placeholder="+228 XX XX XX XX"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="quartier" className="mb-2 block text-sm font-medium">
                    Quartier
                  </label>
                  <div className="relative">
                    <MapPin
                      size={18}
                      className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      id="quartier"
                      className="h-11 pl-10"
                      placeholder="Votre quartier"
                      value={quartier}
                      onChange={(e) => setQuartier(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium">
                  Mot de passe <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="h-11 pr-10 pl-10"
                    placeholder="Minimum 6 caractères"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium">
                  Confirmer le mot de passe <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    className="h-11 pl-10"
                    placeholder="Répétez le mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="h-11 w-full font-bold">
                {isSubmitting ? 'Création du compte...' : 'Créer mon compte'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex-col gap-2 border-t text-center">
            <p className="text-sm text-muted-foreground">
              Vous avez déjà un compte ?{' '}
              <Link href="/login" className="font-medium text-yas-midnight hover:underline">
                Connectez-vous
              </Link>
            </p>
            <p className="text-sm text-muted-foreground">
              Vous êtes un recruteur ?{' '}
              <Link href="/rh/login" className="font-medium text-yas-midnight hover:underline">
                Espace RH
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
