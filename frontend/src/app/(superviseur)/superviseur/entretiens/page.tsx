"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarClock, Link as LinkIcon, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApiError, interviewsApi } from "@/lib/api";
import { INTERVIEW_MODE_LABELS, INTERVIEW_STATUS_LABELS } from "@/lib/constants";
import type { Interview } from "@/lib/types";

export default function SuperviseurEntretiensPage() {
  const queryClient = useQueryClient();
  const [target, setTarget] = useState<Interview | null>(null);
  const [notes, setNotes] = useState("");

  const { data: interviews, isLoading } = useQuery({
    queryKey: ["interviews", "me", "superviseur"],
    queryFn: interviewsApi.me,
  });

  const outcomeMutation = useMutation({
    mutationFn: () =>
      interviewsApi.recordOutcome(target!.id, { status: "termine", notes: notes.trim() || undefined }),
    onSuccess: () => {
      toast.success("Résultat enregistré");
      setTarget(null);
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["interviews", "me", "superviseur"] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Erreur lors de l'enregistrement");
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-yas-midnight">
          Mes entretiens
        </h1>
        <p className="text-muted-foreground">
          Entretiens auxquels vous participez en tant que superviseur.
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
              <Badge variant={interview.status === "planifie" ? "default" : "secondary"}>
                {INTERVIEW_STATUS_LABELS[interview.status]}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                Candidat :{" "}
                <span className="font-medium text-yas-midnight">
                  {interview.application?.user?.fullName ||
                    interview.application?.user?.email}
                </span>
              </p>
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

              {interview.status === "planifie" && (
                <div className="pt-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setTarget(interview);
                      setNotes("");
                    }}
                  >
                    Enregistrer le résultat
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={Boolean(target)} onOpenChange={(open) => !open && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Résultat de l&apos;entretien</DialogTitle>
            <DialogDescription>
              « {target?.application?.offer?.title} » — marque l&apos;entretien comme
              terminé et laisse tes observations.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="outcome-notes">Notes</Label>
            <Textarea
              id="outcome-notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Impressions, points forts, réserves…"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => outcomeMutation.mutate()}
              disabled={outcomeMutation.isPending}
            >
              {outcomeMutation.isPending ? "Enregistrement…" : "Marquer comme terminé"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
