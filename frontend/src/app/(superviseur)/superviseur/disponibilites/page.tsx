"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { interviewRequestsApi } from "@/lib/api";
import { INTERVIEW_REQUEST_STATUS_LABELS } from "@/lib/constants";
import { slotDurationMinutes } from "@/lib/generate-slots";
import type { AvailableSlot, InterviewRequest } from "@/lib/types";
import { RespondAvailabilityDialog } from "@/components/shared/respond-availability-dialog";

function slotDateRange(slots: AvailableSlot[] | null): string {
  if (!slots || slots.length === 0) return "";
  const dates = [...new Set(slots.map((s) => s.date))].sort();
  return dates.length > 1
    ? `Du ${dates[0]} au ${dates[dates.length - 1]}`
    : dates[0];
}

export default function SuperviseurDisponibilitesPage() {
  const [target, setTarget] = useState<{
    request: InterviewRequest;
    status: "disponible" | "indisponible";
  } | null>(null);

  const { data: requests, isLoading } = useQuery({
    queryKey: ["interview-requests", "me"],
    queryFn: interviewRequestsApi.me,
  });

  const pending = useMemo(
    () => (requests ?? []).filter((r) => r.status === "en_attente"),
    [requests]
  );
  const answered = useMemo(
    () => (requests ?? []).filter((r) => r.status !== "en_attente"),
    [requests]
  );

  const hasProposedSlots = (r: InterviewRequest) =>
    Array.isArray(r.availableSlots) && r.availableSlots.length > 0;

  function renderRequest(request: InterviewRequest) {
    const isPending = request.status === "en_attente";
    const title = request.application?.offer?.title ?? "Demande de disponibilité";
    const dateRange = slotDateRange(request.availableSlots);

    return (
      <Card key={request.id}>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <CardTitle className="font-heading text-lg text-yas-midnight">{title}</CardTitle>
          <Badge variant={isPending ? "outline" : "default"}>
            {isPending ? "En attente" : INTERVIEW_REQUEST_STATUS_LABELS[request.status]}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {request.application?.user && (
            <p>
              Candidat :{" "}
              <span className="font-medium text-yas-midnight">
                {request.application.user.fullName || request.application.user.email}
              </span>
            </p>
          )}
          {request.requester && (
            <p className="text-muted-foreground">
              Demandé par {request.requester.fullName || request.requester.email}
            </p>
          )}
          <p className="flex items-center gap-2 text-muted-foreground">
            <CalendarClock className="size-4 text-yas-sky" />
            {new Date(request.createdAt).toLocaleDateString("fr-FR")}
            {dateRange && ` · ${dateRange}`}
          </p>

          {request.message && (
            <div className="whitespace-pre-line rounded-xl bg-slate-50 p-3 text-slate-600">
              {request.message}
            </div>
          )}

          {isPending && hasProposedSlots(request) && (
            <p className="text-muted-foreground">
              {request.availableSlots!.length} créneau
              {request.availableSlots!.length > 1 ? "x" : ""} proposé
              {request.availableSlots!.length > 1 ? "s" : ""} par le RH · Durée{" "}
              {slotDurationMinutes(request.availableSlots![0])} min
            </p>
          )}

          {!isPending && request.availableSlots && request.availableSlots.length > 0 && (
            <div className="text-muted-foreground">
              Créneaux confirmés :
              <ul className="mt-1 list-inside list-disc">
                {request.availableSlots.map((s, i) => (
                  <li key={i}>
                    {s.date} — {s.start} à {s.end}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!isPending && request.availabilityNote && (
            <p className="text-muted-foreground">Note : {request.availabilityNote}</p>
          )}

          {isPending && (
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
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-yas-midnight">
          Demandes de disponibilité
        </h1>
        <p className="text-muted-foreground">
          Le RH souhaite organiser des entretiens et vous a sollicité(e) comme
          participant. Indiquez les créneaux qui vous conviennent.
        </p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Chargement...</p>}
      {!isLoading && (requests ?? []).length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Aucune demande de disponibilité pour le moment.
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {pending.map(renderRequest)}
        {answered.map(renderRequest)}
      </div>

      {target && (
        <RespondAvailabilityDialog
          request={target.request}
          status={target.status}
          open={Boolean(target)}
          onOpenChange={(open) => !open && setTarget(null)}
        />
      )}
    </div>
  );
}
