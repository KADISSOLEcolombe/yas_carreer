"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/shared/password-input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ApiError, authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { ROLE_DASHBOARD_PATH } from "@/lib/constants";
import { AuthSplitLayout } from "@/components/shared/auth-split-layout";

// Miroir des règles serveur (server/validators.ts) — le backend reste la
// source de vérité indépendante, ceci n'améliore que le retour immédiat.
const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
const PHONE_REGEX = /^\+?[0-9]{8,15}$/;

const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "Le prénom est requis")
      .max(50, "50 caractères maximum")
      .regex(NAME_REGEX, "Le prénom ne doit contenir que des lettres"),
    lastName: z
      .string()
      .trim()
      .min(1, "Le nom est requis")
      .max(50, "50 caractères maximum")
      .regex(NAME_REGEX, "Le nom ne doit contenir que des lettres"),
    email: z
      .string()
      .trim()
      .email("Adresse email invalide")
      .max(254, "254 caractères maximum"),
    phone: z
      .string()
      .trim()
      .max(30, "30 caractères maximum")
      .optional()
      .refine((v) => !v || PHONE_REGEX.test(v.replace(/[\s.\-()]/g, "")), {
        message: "Format de téléphone invalide",
      }),
    password: z
      .string()
      .min(8, "8 caractères minimum")
      .max(64, "64 caractères maximum")
      .regex(/[0-9]/, "Doit contenir au moins un chiffre")
      .regex(/[^A-Za-z0-9]/, "Doit contenir au moins un caractère spécial"),
    passwordConfirmation: z
      .string()
      .min(1, "Confirmez votre mot de passe")
      .max(64, "64 caractères maximum"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Les mots de passe ne correspondent pas",
    path: ["passwordConfirmation"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const setAuth = useAuthStore((state) => state.setAuth);
  // Garde synchrone en plus de `isSubmitting` : bloque un second appel même
  // si un double-clic arrive avant le re-render qui désactive le bouton.
  const submittingRef = useRef(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  async function onSubmit(values: RegisterForm) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    try {
      const fullName = `${values.firstName.trim()} ${values.lastName.trim()}`.trim();
      const result = await authApi.register({
        fullName,
        email: values.email.trim(),
        password: values.password,
        passwordConfirmation: values.passwordConfirmation,
        phone: values.phone?.trim() || undefined,
      });
      setAuth(result.user, result.token);
      toast.success(`Bienvenue, ${result.user.fullName || result.user.email} !`);
      if (next && next.startsWith("/")) {
        router.push(next);
      } else {
        router.push(ROLE_DASHBOARD_PATH[result.user.role]);
      }
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Création du compte impossible"
      );
    } finally {
      submittingRef.current = false;
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="font-heading text-2xl text-yas-midnight">
          Créer un compte candidat
        </CardTitle>
        <CardDescription>
          Indispensable pour postuler à une offre et suivre vos candidatures.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                placeholder="Prénom"
                {...register("firstName")}
              />
              {errors.firstName && (
                <p className="text-xs text-destructive">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom *</Label>
              <Input id="lastName" placeholder="Nom" {...register("lastName")} />
              {errors.lastName && (
                <p className="text-xs text-destructive">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="vous@exemple.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" placeholder="+228 …" {...register("phone")} />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe *</Label>
            <PasswordInput id="password" {...register("password")} />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="passwordConfirmation">
              Confirmer le mot de passe *
            </Label>
            <PasswordInput
              id="passwordConfirmation"
              {...register("passwordConfirmation")}
            />
            {errors.passwordConfirmation && (
              <p className="text-xs text-destructive">
                {errors.passwordConfirmation.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-yas-yellow text-yas-midnight hover:bg-yas-yellow/90"
          >
            {isSubmitting ? "Création du compte..." : "Créer mon compte"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link
            href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
            className="font-medium text-yas-midnight hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <AuthSplitLayout>
      <Suspense
        fallback={<div className="text-sm text-muted-foreground">Chargement…</div>}
      >
        <RegisterForm />
      </Suspense>
    </AuthSplitLayout>
  );
}
