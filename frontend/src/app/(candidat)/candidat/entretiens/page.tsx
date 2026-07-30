"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarClock, Link as LinkIcon, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { interviewsApi } from "@/lib/api";
import { INTERVIEW_MODE_LABELS, INTERVIEW_STATUS_LABELS } from "@/lib/constants";

export default function CandidatEntretiensPage() {
  const { data: interviews, isLoading } = useQuery({
    queryKey: ["interviews", "me"],
    queryFn: interviewsApi.me,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-yas-midnight">
          Mes entretiens
        </h1>
        <p className="text-muted-foreground">
          Retrouvez ici les entretiens planifiés par nos équipes RH.
        </p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Chargement...</p>}
      {!isLoading && interviews?.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Aucun entretien programmé pour le moment.
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {interviews?.map((interview) => (
          <Card key={interview.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <CardTitle className="font-heading text-lg text-yas-midnight">
                {interview.application?.offer?.title ?? "Entretien"}
              </CardTitle>
              <Badge
                variant={interview.status === "planifie" ? "default" : "secondary"}
              >
                {INTERVIEW_STATUS_LABELS[interview.status]}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <CalendarClock className="size-4 text-yas-sky" />
                {new Date(interview.scheduledAt).toLocaleString("fr-FR", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="size-4 text-yas-sky" />
                {INTERVIEW_MODE_LABELS[interview.mode]}
              </p>
              {interview.meetingLink && (
                <p className="flex items-center gap-2">
                  <LinkIcon className="size-4 text-yas-sky" />
                  <a
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-yas-midnight underline"
                  >
                    {interview.meetingLink}
                  </a>
                </p>
              )}
              {interview.notes && (
                <p className="text-muted-foreground">{interview.notes}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
