"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarClock, Check, X } from "lucide-react";
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
import { ApiError, interviewRequestsApi } from "@/lib/api";
import { INTERVIEW_REQUEST_STATUS_LABELS } from "@/lib/constants";
import type { InterviewRequest } from "@/lib/types";

export default function SuperviseurDisponibilitesPage() {
  const queryClient = useQueryClient();
  const [target, setTarget] = useState<{
    request: InterviewRequest;
    status: "disponible" | "indisponible";
  } | null>(null);
  const [note, setNote] = useState("");

  const { data: requests, isLoading } = useQuery({
    queryKey: ["interview-requests", "me"],
    queryFn: interviewRequestsApi.me,
  });

  const respondMutation = useMutation({
    mutationFn: () =>
      interviewRequestsApi.respond(target!.request.id, {
        status: target!.status,
        availabilityNote: note.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Réponse envoyée au RH");
      setTarget(null);
      setNote("");
      queryClient.invalidateQueries({ queryKey: ["interview-requests", "me"] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Erreur lors de l'envoi");
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-yas-midnight">
          Demandes de disponibilité
        </h1>
        <p className="text-muted-foreground">
          Le RH souhaite organiser un entretien avec un candidat et vous a
          sollicité(e) comme superviseur.
        </p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Chargement...</p>}
      {!isLoading && requests?.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Aucune demande de disponibilité pour le moment.
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {requests?.map((request) => (
          <Card key={request.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <CardTitle className="font-heading text-lg text-yas-midnight">
                {request.application?.offer?.title ?? "Entretien"}
              </CardTitle>
              <Badge variant={request.status === "en_attente" ? "outline" : "default"}>
                {INTERVIEW_REQUEST_STATUS_LABELS[request.status]}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                Candidat :{" "}
                <span className="font-medium text-yas-midnight">
                  {request.application?.user?.fullName ||
                    request.application?.user?.email}
                </span>
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <CalendarClock className="size-4 text-yas-sky" />
                Demande reçue le{" "}
                {new Date(request.createdAt).toLocaleDateString("fr-FR")}
              </p>
              {request.availabilityNote && (
                <p className="text-muted-foreground">
                  Votre réponse : {request.availabilityNote}
                </p>
              )}

              {request.status === "en_attente" && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setTarget({ request, status: "disponible" })}
                  >
                    <Check className="size-4" />
                    Disponible
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => setTarget({ request, status: "indisponible" })}
                  >
                    <X className="size-4" />
                    Indisponible
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
            <DialogTitle>
              {target?.status === "disponible" ? "Confirmer la disponibilité" : "Signaler une indisponibilité"}
            </DialogTitle>
            <DialogDescription>
              Le RH sera notifié de votre réponse pour « {target?.request.application?.offer?.title} ».
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="note">Note (optionnel)</Label>
            <Textarea
              id="note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex. Disponible mardi après-midi…"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => respondMutation.mutate()}
              disabled={respondMutation.isPending}
            >
              {respondMutation.isPending ? "Envoi…" : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
