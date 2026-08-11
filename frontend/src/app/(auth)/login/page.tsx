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

const loginSchema = z.object({
  email: z.string().trim().email("Adresse email invalide").max(254),
  password: z.string().min(1, "Mot de passe requis").max(64),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginForm() {
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
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginForm) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    try {
      const result = await authApi.login({
        email: values.email.trim(),
        password: values.password,
      });
      const mustChange =
        Boolean(result.user.mustChangePassword) ||
        Boolean(result.mustChangePassword);
      setAuth(
        { ...result.user, mustChangePassword: mustChange },
        result.token
      );
      if (mustChange) {
        toast.message("Définissez votre mot de passe pour continuer");
        router.push("/changer-mot-de-passe");
        return;
      }
      toast.success(`Bienvenue, ${result.user.fullName || result.user.email} !`);
      if (next && next.startsWith("/")) {
        router.push(next);
      } else {
        router.push(ROLE_DASHBOARD_PATH[result.user.role]);
      }
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Connexion impossible"
      );
    } finally {
      submittingRef.current = false;
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="font-heading text-2xl text-yas-midnight">
          Connexion
        </CardTitle>
        <CardDescription>
          Accédez à votre espace YasCareer — Yas Togo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
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
            <Label htmlFor="password">Mot de passe</Label>
            <PasswordInput id="password" {...register("password")} />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-yas-yellow text-yas-midnight hover:bg-yas-yellow/90"
          >
            {isSubmitting ? "Connexion..." : "Se connecter"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link
            href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"}
            className="font-medium text-yas-midnight hover:underline"
          >
            Créer un compte candidat
          </Link>
          {" · "}
          Accès RH / Admin sur invitation uniquement.
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <AuthSplitLayout>
      <Suspense
        fallback={<div className="text-sm text-muted-foreground">Chargement…</div>}
      >
        <LoginForm />
      </Suspense>
    </AuthSplitLayout>
  );
}
