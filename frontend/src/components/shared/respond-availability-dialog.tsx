"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApiError, interviewRequestsApi } from "@/lib/api";
import {
  addMinutesToTime,
  overlapsBreak,
  slotDurationMinutes,
} from "@/lib/generate-slots";
import type { AvailableSlot, InterviewRequest } from "@/lib/types";

const BREAK_START = "12:30";
const BREAK_END = "14:30";

function hasProposedSlots(r: InterviewRequest): boolean {
  return Array.isArray(r.availableSlots) && r.availableSlots.length > 0;
}

function slotPeriod(slots: AvailableSlot[]): { start: string; end: string } {
  const dates = slots.map((s) => s.date).sort();
  return { start: dates[0], end: dates[dates.length - 1] };
}

type AltSlot = { date: string; start: string };

export function RespondAvailabilityDialog({
  request,
  status,
  open,
  onOpenChange,
  onBehalfOfSupervisor = false,
  onSuccess,
}: {
  request: InterviewRequest;
  status: "disponible" | "indisponible";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** true quand c'est le RH qui saisit à la place du superviseur (cas de secours). */
  onBehalfOfSupervisor?: boolean;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");
  const [checkedSlots, setCheckedSlots] = useState<Set<number>>(new Set());
  const [manualSlots, setManualSlots] = useState<AvailableSlot[]>([
    { date: "", start: "09:00", end: "12:00" },
  ]);
  const [proposingAlternative, setProposingAlternative] = useState(false);
  const [altSlots, setAltSlots] = useState<AltSlot[]>([{ date: "", start: "09:00" }]);

  const usesProposedSlots = hasProposedSlots(request);
  const requestDuration = usesProposedSlots
    ? slotDurationMinutes(request.availableSlots![0])
    : null;
  const period = usesProposedSlots ? slotPeriod(request.availableSlots!) : null;

  useEffect(() => {
    if (!open) return;
    setNote("");
    setProposingAlternative(false);
    setAltSlots([{ date: "", start: "09:00" }]);
    if (status === "disponible" && usesProposedSlots) {
      setCheckedSlots(new Set(request.availableSlots!.map((_, i) => i)));
    } else {
      setManualSlots([{ date: "", start: "09:00", end: "12:00" }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, request.id, status]);

  function toggleSlot(index: number) {
    setCheckedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function updateManualSlot(index: number, patch: Partial<AvailableSlot>) {
    setManualSlots((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function updateAltSlot(index: number, patch: Partial<AltSlot>) {
    setAltSlots((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function startProposingAlternative() {
    setProposingAlternative(true);
    if (!note.trim()) {
      setNote("Aucun des créneaux proposés ne me convenait — voici d'autres disponibilités.");
    }
  }

  const altSlotsAsAvailable: AvailableSlot[] = altSlots
    .filter((s) => s.date && s.start)
    .map((s) => ({ date: s.date, start: s.start, end: addMinutesToTime(s.start, requestDuration ?? 30) }));
  const altSlotsWithBreakConflict = altSlotsAsAvailable.filter((s) =>
    overlapsBreak(s, BREAK_START, BREAK_END)
  );

  const confirmedSlots = proposingAlternative
    ? altSlotsAsAvailable
    : usesProposedSlots
      ? (request.availableSlots ?? []).filter((_, i) => checkedSlots.has(i))
      : manualSlots.filter((s) => s.date && s.start && s.end);

  const respondMutation = useMutation({
    mutationFn: () =>
      interviewRequestsApi.respond(request.id, {
        status,
        availabilityNote: note.trim() || undefined,
        availableSlots: status === "disponible" ? confirmedSlots : undefined,
      }),
    onSuccess: () => {
      toast.success("Réponse envoyée");
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["interview-requests"] });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Erreur lors de l'envoi");
    },
  });

  const canSubmit =
    status !== "disponible" ||
    (confirmedSlots.length > 0 && (!proposingAlternative || altSlotsWithBreakConflict.length === 0));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {onBehalfOfSupervisor
              ? `Saisir la disponibilité de ${request.supervisor?.fullName || request.supervisor?.email || "ce superviseur"}`
              : status === "disponible"
                ? "Indiquer mes disponibilités"
                : "Signaler une indisponibilité"}
          </DialogTitle>
          <DialogDescription>
            {onBehalfOfSupervisor
              ? "À utiliser uniquement si le superviseur ne peut pas répondre lui-même dans l'application."
              : "Le RH sera notifié de votre réponse."}
          </DialogDescription>
        </DialogHeader>

        {usesProposedSlots && period && requestDuration != null && (
          <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <span className="font-medium text-yas-midnight">Demande du RH</span> — Période du{" "}
            {period.start} au {period.end} · Durée d&apos;entretien : {requestDuration} min ·{" "}
            {request.availableSlots!.length} créneau{request.availableSlots!.length > 1 ? "x" : ""}{" "}
            proposé{request.availableSlots!.length > 1 ? "s" : ""}
          </div>
        )}

        {status === "disponible" && usesProposedSlots && !proposingAlternative && (
          <div className="space-y-2">
            <Label>Cochez les créneaux disponibles</Label>
            <div className="max-h-64 space-y-1.5 overflow-y-auto rounded-xl border border-slate-100 p-2">
              {request.availableSlots!.map((slot, i) => (
                <label
                  key={i}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50"
                >
                  <Checkbox checked={checkedSlots.has(i)} onCheckedChange={() => toggleSlot(i)} />
                  {slot.date} — {slot.start} à {slot.end}
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={startProposingAlternative}
              className="text-xs font-medium text-yas-midnight underline underline-offset-2 hover:text-yas-midnight/70"
            >
              Aucun de ces créneaux ne me convient — proposer d&apos;autres disponibilités
            </button>
          </div>
        )}

        {status === "disponible" && usesProposedSlots && proposingAlternative && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Mes autres disponibilités ({requestDuration} min chacune)</Label>
              <button
                type="button"
                onClick={() => setProposingAlternative(false)}
                className="text-xs font-medium text-slate-500 underline underline-offset-2 hover:text-slate-700"
              >
                Revenir aux créneaux proposés
              </button>
            </div>
            {altSlots.map((slot, i) => {
              const preview = slot.start
                ? { date: slot.date, start: slot.start, end: addMinutesToTime(slot.start, requestDuration ?? 30) }
                : null;
              const conflict = preview ? overlapsBreak(preview, BREAK_START, BREAK_END) : false;
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={slot.date}
                      onChange={(e) => updateAltSlot(i, { date: e.target.value })}
                      className="flex-1"
                    />
                    <Input
                      type="time"
                      value={slot.start}
                      onChange={(e) => updateAltSlot(i, { start: e.target.value })}
                      className="w-28"
                    />
                    <span className="text-xs text-muted-foreground">
                      {preview && `→ ${preview.end}`}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setAltSlots((prev) => prev.filter((_, idx) => idx !== i))}
                      className="shrink-0 text-slate-400 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  {conflict && (
                    <p className="text-xs text-destructive">
                      Ce créneau chevauche la pause ({BREAK_START}–{BREAK_END}).
                    </p>
                  )}
                </div>
              );
            })}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setAltSlots((prev) => [...prev, { date: "", start: "09:00" }])}
            >
              <Plus className="size-4" />
              Ajouter un créneau
            </Button>
            <p className="text-xs text-slate-400">
              Ces propositions remontent au RH pour ajustement.
            </p>
          </div>
        )}

        {status === "disponible" && !usesProposedSlots && (
          <div className="space-y-3">
            <Label>Créneaux disponibles</Label>
            {manualSlots.map((slot, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  type="date"
                  value={slot.date}
                  onChange={(e) => updateManualSlot(i, { date: e.target.value })}
                  className="flex-1"
                />
                <Input
                  type="time"
                  value={slot.start}
                  onChange={(e) => updateManualSlot(i, { start: e.target.value })}
                  className="w-28"
                />
                <span className="text-muted-foreground">à</span>
                <Input
                  type="time"
                  value={slot.end}
                  onChange={(e) => updateManualSlot(i, { end: e.target.value })}
                  className="w-28"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setManualSlots((prev) => prev.filter((_, idx) => idx !== i))}
                  className="shrink-0 text-slate-400 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() =>
                setManualSlots((prev) => [...prev, { date: "", start: "09:00", end: "12:00" }])
              }
            >
              <Plus className="size-4" />
              Ajouter un créneau
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="availability-response-note">Note (optionnel)</Label>
          <Textarea
            id="availability-response-note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex. Préférence pour les matinées…"
          />
        </div>
        <DialogFooter>
          <Button
            onClick={() => respondMutation.mutate()}
            disabled={respondMutation.isPending || !canSubmit}
          >
            {respondMutation.isPending ? "Envoi…" : "Confirmer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
