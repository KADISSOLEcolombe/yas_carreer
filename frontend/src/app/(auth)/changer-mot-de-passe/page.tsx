"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
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
import { RouteGuard } from "@/components/shared/route-guard";
import { AuthCenteredShell } from "@/components/shared/auth-centered-shell";

const schema = z
  .object({
    currentPassword: z.string().optional(),
    password: z.string().min(8, "Au moins 8 caractères"),
    passwordConfirmation: z.string().min(8, "Confirmez le mot de passe"),
  })
  .refine((v) => v.password === v.passwordConfirmation, {
    message: "Les mots de passe ne correspondent pas",
    path: ["passwordConfirmation"],
  });

type FormValues = z.infer<typeof schema>;

function ChangePasswordForm() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const forced = Boolean(user?.mustChangePassword);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      const result = await authApi.changePassword({
        currentPassword: forced ? undefined : values.currentPassword,
        password: values.password,
        passwordConfirmation: values.passwordConfirmation,
      });
      setUser({ ...result.user, mustChangePassword: false });
      toast.success(result.message || "Mot de passe mis à jour");
      router.replace(
        ROLE_DASHBOARD_PATH[result.user.role] || "/candidat/dashboard"
      );
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Impossible de changer le mot de passe"
      );
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="font-heading text-2xl text-yas-midnight">
          {forced ? "Définir votre mot de passe" : "Modifier le mot de passe"}
        </CardTitle>
        <CardDescription>
          {forced
            ? "Pour sécuriser votre accès YasCareer, choisissez un nouveau mot de passe avant de continuer."
            : "Mettez à jour votre mot de passe de connexion."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!forced && (
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                {...register("currentPassword")}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="password">Nouveau mot de passe</Label>
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
            variant="midnight"
            className="h-11 w-full rounded-xl"
          >
            {isSubmitting ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ChangePasswordPage() {
  return (
    <RouteGuard allow={["admin", "rh", "candidat"]}>
      <AuthCenteredShell>
        <Suspense
          fallback={
            <div className="h-40 w-full max-w-md animate-pulse rounded-xl bg-muted" />
          }
        >
          <ChangePasswordForm />
        </Suspense>
      </AuthCenteredShell>
    </RouteGuard>
  );
}
