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

const schema = z
  .object({
    password: z.string().min(8, "Au moins 8 caractères"),
    passwordConfirmation: z.string().min(8, "Confirmez le mot de passe"),
  })
  .refine((v) => v.password === v.passwordConfirmation, {
    message: "Les mots de passe ne correspondent pas",
    path: ["passwordConfirmation"],
  });

type FormValues = z.infer<typeof schema>;

function ActivateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const setAuth = useAuthStore((state) => state.setAuth);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", passwordConfirmation: "" },
  });

  async function onSubmit(values: FormValues) {
    if (!token) {
      toast.error("Lien d’activation invalide");
      return;
    }
    try {
      const result = await authApi.activateAccount({
        token,
        password: values.password,
        passwordConfirmation: values.passwordConfirmation,
      });
      setAuth(result.user, result.token);
      toast.success(result.message || "Compte activé — bienvenue !");
      router.push(ROLE_DASHBOARD_PATH[result.user.role] || "/candidat");
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Activation impossible"
      );
    }
  }

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-heading text-2xl text-yas-midnight">
            Lien invalide
          </CardTitle>
          <CardDescription>
            Ce lien d’activation est manquant ou incorrect. Vérifiez votre email
            ou{" "}
            <Link href="/login" className="text-yas-sky underline">
              connectez-vous
            </Link>
            .
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="font-heading text-2xl text-yas-midnight">
          Activer mon suivi
        </CardTitle>
        <CardDescription>
          Définissez un mot de passe pour accéder à votre espace candidat et
          suivre vos candidatures.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="passwordConfirmation">Confirmation</Label>
            <Input
              id="passwordConfirmation"
              type="password"
              autoComplete="new-password"
              {...register("passwordConfirmation")}
            />
            {errors.passwordConfirmation && (
              <p className="text-sm text-destructive">
                {errors.passwordConfirmation.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-yas-midnight hover:bg-yas-midnight/90"
          >
            {isSubmitting ? "Activation…" : "Activer mon espace"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ActivateAccountPage() {
  return (
    <Suspense
      fallback={
        <div className="h-40 w-full max-w-md animate-pulse rounded-xl bg-muted" />
      }
    >
      <ActivateForm />
    </Suspense>
  );
}
