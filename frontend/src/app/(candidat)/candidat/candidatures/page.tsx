"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { CalendarClock, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { applicationsApi } from "@/lib/api";
import {
  APPLICATION_STATUS_BADGE_VARIANT,
  APPLICATION_STATUS_LABELS,
  INTERVIEW_MODE_LABELS,
} from "@/lib/constants";
import { ApplicationStepper } from "@/components/shared/application-stepper";

export default function CandidatCandidaturesPage() {
  const { data: applications, isLoading } = useQuery({
    queryKey: ["applications", "me"],
    queryFn: applicationsApi.me,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-yas-midnight">
          Mes candidatures
        </h1>
        <p className="text-muted-foreground">
          Suivez l&apos;avancement de chacune de vos candidatures.
        </p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Chargement...</p>}
      {!isLoading && applications?.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Vous n&apos;avez pas encore postulé.{" "}
            <Link href="/offres" className="text-yas-midnight underline">
              Voir les offres
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {applications?.map((app) => (
          <Card key={app.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle className="font-heading text-lg text-yas-midnight">
                  <Link href={`/offres/${app.offerId}`} className="hover:underline">
                    {app.offer?.title ?? `Offre #${app.offerId}`}
                  </Link>
                </CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  Envoyée le {new Date(app.appliedAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <Badge variant={APPLICATION_STATUS_BADGE_VARIANT[app.status]}>
                {APPLICATION_STATUS_LABELS[app.status]}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <ApplicationStepper status={app.status} />
              {app.aiSummary && (
                <div className="flex gap-2 rounded-lg bg-muted p-3 text-sm">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-yas-sky" />
                  <div>
                    <p className="font-medium text-yas-midnight">
                      Analyse IA {app.aiMatchScore != null ? `— ${app.aiMatchScore}/100` : ""}
                    </p>
                    <p className="text-muted-foreground">{app.aiSummary}</p>
                  </div>
                </div>
              )}
              {app.interview && (
                <div className="flex items-center gap-2 rounded-lg border border-yas-sky/30 bg-yas-sky/10 p-3 text-sm">
                  <CalendarClock className="size-4 text-yas-midnight" />
                  <span>
                    Entretien {INTERVIEW_MODE_LABELS[app.interview.mode]} le{" "}
                    {new Date(app.interview.scheduledAt).toLocaleString("fr-FR")}
                    {app.interview.meetingLink && (
                      <>
                        {" — "}
                        <a
                          href={app.interview.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-yas-midnight underline"
                        >
                          Lien de connexion
                        </a>
                      </>
                    )}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
