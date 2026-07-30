"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { FileText, CalendarClock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { dashboardApi, applicationsApi } from "@/lib/api";
import {
  APPLICATION_STATUS_BADGE_VARIANT,
  APPLICATION_STATUS_LABELS,
} from "@/lib/constants";
import { useAuthStore } from "@/lib/auth-store";

export default function CandidatDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { data: stats } = useQuery({
    queryKey: ["dashboard", "candidate"],
    queryFn: dashboardApi.candidate,
  });
  const { data: applications } = useQuery({
    queryKey: ["applications", "me"],
    queryFn: applicationsApi.me,
  });

  const recent = applications?.slice(0, 3) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-yas-midnight">
          Bonjour {user?.fullName?.split(" ")[0] || "candidat"}
        </h1>
        <p className="text-muted-foreground">
          Voici un aperçu de votre parcours de candidature.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Candidatures
            </CardTitle>
            <FileText className="size-4 text-yas-sky" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yas-midnight">
              {stats?.applicationsTotal ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Entretiens à venir
            </CardTitle>
            <CalendarClock className="size-4 text-yas-sky" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yas-midnight">
              {stats?.interviewsUpcoming ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En cours d&apos;analyse
            </CardTitle>
            <TrendingUp className="size-4 text-yas-sky" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yas-midnight">
              {stats?.applicationsByStatus?.en_cours_analyse ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-heading text-lg text-yas-midnight">
            Candidatures récentes
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/candidat/candidatures">Tout voir</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {recent.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Vous n&apos;avez pas encore postulé.{" "}
              <Link href="/offres" className="text-yas-midnight underline">
                Découvrir les offres
              </Link>
            </p>
          )}
          {recent.map((app) => (
            <div
              key={app.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <p className="font-medium">{app.offer?.title}</p>
                <p className="text-xs text-muted-foreground">
                  Envoyée le {new Date(app.appliedAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <Badge variant={APPLICATION_STATUS_BADGE_VARIANT[app.status]}>
                {APPLICATION_STATUS_LABELS[app.status]}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
