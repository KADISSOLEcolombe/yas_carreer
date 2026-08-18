"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supervisionNotesApi } from "@/lib/api";
import { RECOMMENDATION_LABELS } from "@/lib/constants";
import type { SupervisionNote } from "@/lib/types";
import { SoftCard, SoftStatusPill } from "@/components/shared/soft-ui";
import { InterviewEvaluationDialog } from "@/components/shared/interview-evaluation-dialog";

export default function SuperviseurEvaluationsPage() {
  const [target, setTarget] = useState<SupervisionNote | null>(null);

  const { data: evaluations, isLoading } = useQuery({
    queryKey: ["supervision-notes", "me"],
    queryFn: supervisionNotesApi.me,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-yas-midnight">
          Mes évaluations
        </h1>
        <p className="text-muted-foreground">
          Historique de vos évaluations d&apos;entretien déjà envoyées.
        </p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Chargement...</p>}
      {!isLoading && evaluations?.length === 0 && (
        <SoftCard>
          <p className="py-10 text-center text-muted-foreground">
            Aucune évaluation envoyée pour le moment.
          </p>
        </SoftCard>
      )}

      {!isLoading && evaluations && evaluations.length > 0 && (
        <SoftCard className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs text-slate-500">
                  <th className="px-4 py-3 font-medium">Candidat</th>
                  <th className="px-3 py-3 font-medium">Offre</th>
                  <th className="px-3 py-3 font-medium">Date entretien</th>
                  <th className="px-3 py-3 font-medium">Note</th>
                  <th className="px-3 py-3 font-medium">Recommandation</th>
                  <th className="px-3 py-3 font-medium">Statut</th>
                  <th className="w-28 px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {evaluations.map((note) => {
                  const app = note.application;
                  const name = app?.user?.fullName || app?.user?.email || "—";
                  const interviewDate = app?.interview?.scheduledAt;
                  return (
                    <tr
                      key={note.id}
                      className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/70"
                    >
                      <td className="px-4 py-3.5 font-semibold text-slate-800">{name}</td>
                      <td className="max-w-[200px] truncate px-3 py-3.5 text-foreground">
                        {app?.offer?.title ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-slate-500">
                        {interviewDate
                          ? new Date(interviewDate).toLocaleDateString("fr-FR")
                          : "—"}
                      </td>
                      <td className="px-3 py-3.5">
                        {note.rating != null ? (
                          <span className="inline-flex items-center gap-1 font-medium text-yas-midnight">
                            <Star className="size-3.5 fill-yas-yellow text-yas-yellow" />
                            {note.rating}/5
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-3 py-3.5 text-muted-foreground">
                        {note.recommendation ? RECOMMENDATION_LABELS[note.recommendation] : "—"}
                      </td>
                      <td className="px-3 py-3.5">
                        <SoftStatusPill tone="success">Envoyée</SoftStatusPill>
                      </td>
                      <td className="px-3 py-3.5 text-right">
                        <Button variant="ghost" size="sm" onClick={() => setTarget(note)}>
                          Voir l&apos;évaluation
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SoftCard>
      )}

      {target && target.applicationId && (
        <InterviewEvaluationDialog
          applicationId={target.applicationId}
          candidateName={
            target.application?.user?.fullName || target.application?.user?.email || "Candidat"
          }
          offerTitle={target.application?.offer?.title ?? "—"}
          existingNote={target}
          open={Boolean(target)}
          onOpenChange={(open) => !open && setTarget(null)}
        />
      )}
    </div>
  );
}
