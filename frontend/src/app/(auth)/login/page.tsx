"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

type LoginForm = z.infer<typeof loginSchema>;

const DEMO_ACCOUNTS = [
  { role: "Admin", email: "admin@yascareer.tg" },
  { role: "RH", email: "rh@yascareer.tg" },
  { role: "Candidat", email: "candidat@yascareer.tg" },
] as const;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const setAuth = useAuthStore((state) => state.setAuth);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "Password123!" },
  });

  async function onSubmit(values: LoginForm) {
    try {
      const result = await authApi.login(values);
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
            <Input id="password" type="password" {...register("password")} />
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

        <div className="mt-6 rounded-xl border border-dashed bg-secondary/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-yas-midnight">
            Comptes de démo
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Mot de passe commun : <code className="font-mono">Password123!</code>
          </p>
          <ul className="mt-3 space-y-2">
            {DEMO_ACCOUNTS.map((account) => (
              <li key={account.email}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg bg-white px-3 py-2 text-left text-sm transition hover:bg-yas-yellow/30"
                  onClick={() => {
                    setValue("email", account.email);
                    setValue("password", "Password123!");
                  }}
                >
                  <span className="font-medium text-yas-midnight">
                    {account.role}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {account.email}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Candidat ?{" "}
          <Link
            href="/offres"
            className="font-medium text-yas-midnight hover:underline"
          >
            Postulez depuis une offre
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
    <Suspense
      fallback={
        <div className="text-sm text-muted-foreground">Chargement…</div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
