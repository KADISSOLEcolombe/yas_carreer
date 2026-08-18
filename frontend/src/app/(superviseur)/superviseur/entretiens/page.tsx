"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CalendarClock,
  ClipboardEdit,
  Eye,
  Link as LinkIcon,
  MapPin,
  MoreHorizontal,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ApiError, interviewsApi, supervisionNotesApi } from "@/lib/api";
import { INTERVIEW_MODE_LABELS } from "@/lib/constants";
import type { Interview, SupervisionNote } from "@/lib/types";
import { SoftCard, SoftStatusPill } from "@/components/shared/soft-ui";
import { InterviewEvaluationDialog } from "@/components/shared/interview-evaluation-dialog";

function avatarInitials(name?: string | null, email?: string | null): string {
  const source = name || email || "";
  return source
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function SuperviseurEntretiensPage() {
  const queryClient = useQueryClient();
  const [outcomeTarget, setOutcomeTarget] = useState<Interview | null>(null);
  const [notes, setNotes] = useState("");
  const [detailsTarget, setDetailsTarget] = useState<Interview | null>(null);
  const [evalTarget, setEvalTarget] = useState<Interview | null>(null);

  const { data: interviews, isLoading } = useQuery({
    queryKey: ["interviews", "me", "superviseur"],
    queryFn: interviewsApi.me,
  });

  const { data: evaluations } = useQuery({
    queryKey: ["supervision-notes", "me"],
    queryFn: supervisionNotesApi.me,
  });

  const evalByApplicationId = useMemo(() => {
    const map = new Map<number, SupervisionNote>();
    for (const note of evaluations ?? []) {
      if (note.applicationId) map.set(note.applicationId, note);
    }
    return map;
  }, [evaluations]);

  const outcomeMutation = useMutation({
    mutationFn: () =>
      interviewsApi.recordOutcome(outcomeTarget!.id, {
        status: "termine",
        notes: notes.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Résultat enregistré");
      setOutcomeTarget(null);
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["interviews", "me", "superviseur"] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Erreur lors de l'enregistrement");
    },
  });

  function rowStatus(interview: Interview) {
    if (interview.status === "annule") return { label: "Annulé", tone: "danger" as const };
    if (interview.status === "planifie") return { label: "Programmé", tone: "info" as const };
    const hasEval = evalByApplicationId.has(interview.applicationId);
    return hasEval
      ? { label: "Évaluation envoyée", tone: "success" as const }
      : { label: "Entretien réalisé — à évaluer", tone: "warning" as const };
  }

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
        <SoftCard>
          <p className="py-10 text-center text-muted-foreground">
            Aucun entretien programmé pour le moment.
          </p>
        </SoftCard>
      )}

      {!isLoading && interviews && interviews.length > 0 && (
        <SoftCard className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs text-slate-500">
                  <th className="px-4 py-3 font-medium">Candidat</th>
                  <th className="px-3 py-3 font-medium">Offre</th>
                  <th className="px-3 py-3 font-medium">Date entretien</th>
                  <th className="px-3 py-3 font-medium">Statut</th>
                  <th className="w-12 px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {interviews.map((interview) => {
                  const name =
                    interview.application?.user?.fullName ||
                    interview.application?.user?.email ||
                    "—";
                  const status = rowStatus(interview);
                  const evaluation = evalByApplicationId.get(interview.applicationId);

                  return (
                    <tr
                      key={interview.id}
                      className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/70"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9 bg-yas-sky/15">
                            <AvatarFallback className="bg-yas-sky/15 text-xs font-semibold text-yas-midnight">
                              {avatarInitials(
                                interview.application?.user?.fullName,
                                interview.application?.user?.email
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-800">{name}</p>
                            <p className="truncate text-xs text-slate-400">
                              {interview.application?.user?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-[220px] truncate px-3 py-3.5 text-foreground">
                        {interview.application?.offer?.title ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-slate-500">
                        {new Date(interview.scheduledAt).toLocaleString("fr-FR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-3 py-3.5">
                        <SoftStatusPill tone={status.tone}>{status.label}</SoftStatusPill>
                      </td>
                      <td className="px-3 py-3.5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 rounded-lg">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/superviseur/candidature/${interview.applicationId}`}>
                                <Eye className="size-4" />
                                Voir le dossier
                              </Link>
                            </DropdownMenuItem>
                            {interview.status === "termine" && (
                              <DropdownMenuItem onClick={() => setEvalTarget(interview)}>
                                <ClipboardEdit className="size-4" />
                                {evaluation ? "Voir l'évaluation" : "Faire l'évaluation"}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => setDetailsTarget(interview)}>
                              <CalendarClock className="size-4" />
                              Voir les détails de l&apos;entretien
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SoftCard>
      )}

      {/* Détails de l'entretien (lecture seule) */}
      <Dialog open={Boolean(detailsTarget)} onOpenChange={(open) => !open && setDetailsTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails de l&apos;entretien</DialogTitle>
            <DialogDescription>
              {detailsTarget?.application?.offer?.title}
            </DialogDescription>
          </DialogHeader>
          {detailsTarget && (
            <div className="space-y-3 text-sm">
              <p className="flex items-center gap-2">
                <CalendarClock className="size-4 text-yas-sky" />
                {new Date(detailsTarget.scheduledAt).toLocaleString("fr-FR", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
              <p className="text-muted-foreground">
                Durée : {detailsTarget.durationMinutes} min
              </p>
              <p className="text-muted-foreground">
                Mode : {INTERVIEW_MODE_LABELS[detailsTarget.mode]}
              </p>
              {detailsTarget.mode === "presentiel" && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="size-4 text-yas-sky" />
                  Lieu : {detailsTarget.location || "Non renseigné"}
                </p>
              )}
              {detailsTarget.mode === "distanciel" && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <LinkIcon className="size-4 text-yas-sky" />
                  {detailsTarget.meetingLink ? (
                    <a
                      href={detailsTarget.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-yas-midnight underline"
                    >
                      Rejoindre l&apos;entretien
                    </a>
                  ) : (
                    "Lien non renseigné"
                  )}
                </p>
              )}
              {detailsTarget.notes && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Notes de programmation
                  </p>
                  <p className="mt-1 whitespace-pre-line text-muted-foreground">
                    {detailsTarget.notes}
                  </p>
                </div>
              )}
              {detailsTarget.status === "planifie" && (
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setOutcomeTarget(detailsTarget);
                    setNotes("");
                    setDetailsTarget(null);
                  }}
                >
                  Enregistrer le résultat
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Évaluation d'entretien */}
      {evalTarget && (
        <InterviewEvaluationDialog
          applicationId={evalTarget.applicationId}
          candidateName={
            evalTarget.application?.user?.fullName ||
            evalTarget.application?.user?.email ||
            "Candidat"
          }
          offerTitle={evalTarget.application?.offer?.title ?? "—"}
          existingNote={evalByApplicationId.get(evalTarget.applicationId) ?? null}
          open={Boolean(evalTarget)}
          onOpenChange={(open) => !open && setEvalTarget(null)}
        />
      )}

      {/* Enregistrer le résultat d'un entretien planifié */}
      <Dialog open={Boolean(outcomeTarget)} onOpenChange={(open) => !open && setOutcomeTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Résultat de l&apos;entretien</DialogTitle>
            <DialogDescription>
              « {outcomeTarget?.application?.offer?.title} » — marque l&apos;entretien comme
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
