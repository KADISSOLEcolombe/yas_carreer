"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarClock, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ApiError, departementsApi, interviewRequestsApi, usersApi } from "@/lib/api";
import { generateAvailabilitySlots, slotKey } from "@/lib/generate-slots";
import type { AvailableSlot } from "@/lib/types";

const DURATION_OPTIONS = [30, 45, 60];

function formatDateFr(dateStr: string): string {
  if (!dateStr) return "[date]";
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });
}

function buildMessage(
  supervisorNames: string[],
  periodStart: string,
  periodEnd: string,
  dayStart: string,
  dayEnd: string
): string {
  const greeting =
    supervisorNames.length === 1 ? `Bonjour ${supervisorNames[0]},` : "Bonjour,";
  return `${greeting}

Dans le cadre de la programmation prochaine des entretiens, nous souhaitons recueillir vos disponibilités afin d'organiser les différents entretiens avec les candidats.

Merci de nous indiquer vos disponibilités sur la période du ${formatDateFr(periodStart)} au ${formatDateFr(periodEnd)}, entre ${dayStart || "[heure]"} et ${dayEnd || "[heure]"}. Vous pouvez sélectionner les différents créneaux pendant lesquels vous êtes disponible.

Merci pour votre retour.

Cordialement,
L'équipe RH de YAS TOGO`;
}

const MAX_PROPOSED_SLOTS = 100;

export function RequestAvailabilityDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const [departementId, setDepartementId] = useState("");
  const [selectedSupervisorIds, setSelectedSupervisorIds] = useState<number[]>([]);

  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [dayStart, setDayStart] = useState("08:00");
  const [dayEnd, setDayEnd] = useState("17:30");
  const [excludeBreak, setExcludeBreak] = useState(true);
  const [breakStart, setBreakStart] = useState("12:30");
  const [breakEnd, setBreakEnd] = useState("14:30");
  const [durationMinutes, setDurationMinutes] = useState(30);

  const [excludedSlotKeys, setExcludedSlotKeys] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("");
  const [messageDirty, setMessageDirty] = useState(false);

  const { data: departements } = useQuery({
    queryKey: ["departements"],
    queryFn: departementsApi.list,
    enabled: open,
  });

  const { data: allSupervisors } = useQuery({
    queryKey: ["users", "superviseur"],
    queryFn: () => usersApi.list("superviseur"),
    enabled: open,
  });

  const supervisors = useMemo(
    () =>
      (allSupervisors ?? []).filter(
        (s) => departementId && s.departementId === Number(departementId)
      ),
    [allSupervisors, departementId]
  );

  function resetForm() {
    setDepartementId("");
    setSelectedSupervisorIds([]);
    setPeriodStart("");
    setPeriodEnd("");
    setDayStart("08:00");
    setDayEnd("17:30");
    setExcludeBreak(true);
    setBreakStart("12:30");
    setBreakEnd("14:30");
    setDurationMinutes(30);
    setExcludedSlotKeys(new Set());
    setMessage("");
    setMessageDirty(false);
  }

  useEffect(() => {
    setSelectedSupervisorIds((prev) => prev.filter((id) => supervisors.some((s) => s.id === id)));
  }, [supervisors]);

  function toggleSupervisor(id: number, checked: boolean) {
    setSelectedSupervisorIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  }

  const generatedSlots = useMemo(
    () =>
      generateAvailabilitySlots({
        periodStart,
        periodEnd,
        dayStart,
        dayEnd,
        durationMinutes,
        breakStart: excludeBreak ? breakStart : undefined,
        breakEnd: excludeBreak ? breakEnd : undefined,
      }),
    [periodStart, periodEnd, dayStart, dayEnd, durationMinutes, excludeBreak, breakStart, breakEnd]
  );

  const proposedSlots: AvailableSlot[] = useMemo(
    () => generatedSlots.filter((s) => !excludedSlotKeys.has(slotKey(s))),
    [generatedSlots, excludedSlotKeys]
  );

  const slotsByDate = useMemo(() => {
    const map = new Map<string, AvailableSlot[]>();
    for (const slot of generatedSlots) {
      const bucket = map.get(slot.date) ?? [];
      bucket.push(slot);
      map.set(slot.date, bucket);
    }
    return map;
  }, [generatedSlots]);

  function toggleSlot(slot: AvailableSlot) {
    const key = slotKey(slot);
    setExcludedSlotKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  useEffect(() => {
    if (messageDirty) return;
    const names = selectedSupervisorIds
      .map((id) => supervisors.find((s) => s.id === id))
      .filter((s): s is NonNullable<typeof s> => Boolean(s))
      .map((s) => s.fullName || s.email);
    setMessage(buildMessage(names, periodStart, periodEnd, dayStart, dayEnd));
  }, [selectedSupervisorIds, supervisors, periodStart, periodEnd, dayStart, dayEnd, messageDirty]);

  const requestMutation = useMutation({
    mutationFn: () =>
      interviewRequestsApi.requestAvailability({
        supervisorIds: selectedSupervisorIds,
        proposedSlots,
        message: message.trim(),
      }),
    onSuccess: (created) => {
      toast.success(
        `Demande envoyée à ${created.length} superviseur${created.length > 1 ? "s" : ""}`
      );
      queryClient.invalidateQueries({ queryKey: ["interview-requests"] });
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Envoi impossible");
    },
  });

  const canSend =
    selectedSupervisorIds.length > 0 &&
    proposedSlots.length > 0 &&
    proposedSlots.length <= MAX_PROPOSED_SLOTS &&
    message.trim().length > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button className="h-10 gap-2 rounded-xl bg-yas-midnight px-4 text-white hover:bg-yas-midnight/90">
          <Users className="size-4" />
          Demander les disponibilités
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Demander les disponibilités</DialogTitle>
          <DialogDescription>
            Sollicitez un ou plusieurs superviseurs pour connaître leurs créneaux
            disponibles avant de programmer les entretiens.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Département</Label>
            <Select value={departementId} onValueChange={setDepartementId}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Choisir un département" />
              </SelectTrigger>
              <SelectContent>
                {departements?.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {departementId && (
            <div className="space-y-2">
              <Label>Superviseur(s)</Label>
              {supervisors.length === 0 && (
                <p className="text-sm text-slate-400">
                  Aucun superviseur rattaché à ce département.
                </p>
              )}
              <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-xl border border-slate-100 p-2">
                {supervisors.map((s) => (
                  <label
                    key={s.id}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50"
                  >
                    <Checkbox
                      checked={selectedSupervisorIds.includes(s.id)}
                      onCheckedChange={(c) => toggleSupervisor(s.id, c === true)}
                    />
                    {s.fullName || s.email}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Date de début</Label>
              <Input
                type="date"
                className="rounded-xl"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Date de fin</Label>
              <Input
                type="date"
                className="rounded-xl"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Heure de début</Label>
              <Input
                type="time"
                className="rounded-xl"
                value={dayStart}
                onChange={(e) => setDayStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Heure de fin</Label>
              <Input
                type="time"
                className="rounded-xl"
                value={dayEnd}
                onChange={(e) => setDayEnd(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Checkbox
                checked={excludeBreak}
                onCheckedChange={(c) => setExcludeBreak(c === true)}
              />
              Exclure une pause déjeuner
            </label>
            {excludeBreak && (
              <div className="grid grid-cols-2 gap-3 pl-6">
                <Input
                  type="time"
                  className="rounded-xl"
                  value={breakStart}
                  onChange={(e) => setBreakStart(e.target.value)}
                />
                <Input
                  type="time"
                  className="rounded-xl"
                  value={breakEnd}
                  onChange={(e) => setBreakEnd(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Durée d&apos;un créneau</Label>
            <Select
              value={String(durationMinutes)}
              onValueChange={(v) => setDurationMinutes(Number(v))}
            >
              <SelectTrigger className="w-40 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d} min
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {generatedSlots.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>
                  Créneaux à proposer ({proposedSlots.length}/{generatedSlots.length})
                </Label>
                {proposedSlots.length > MAX_PROPOSED_SLOTS && (
                  <span className="text-xs font-medium text-destructive">
                    Max {MAX_PROPOSED_SLOTS} créneaux — décochez-en
                  </span>
                )}
              </div>
              <div className="max-h-56 space-y-3 overflow-y-auto rounded-xl border border-slate-100 p-2">
                {[...slotsByDate.entries()].map(([date, slots]) => (
                  <div key={date}>
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <CalendarClock className="size-3.5" />
                      {new Date(`${date}T00:00:00`).toLocaleDateString("fr-FR", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {slots.map((slot) => {
                        const key = slotKey(slot);
                        const checked = !excludedSlotKeys.has(key);
                        return (
                          <label
                            key={key}
                            className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2 py-1 text-xs ${
                              checked
                                ? "border-yas-sky/40 bg-yas-sky/10 text-yas-midnight"
                                : "border-slate-100 text-slate-400"
                            }`}
                          >
                            <Checkbox checked={checked} onCheckedChange={() => toggleSlot(slot)} />
                            {slot.start}–{slot.end}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="availability-message">Message</Label>
            <Textarea
              id="availability-message"
              rows={8}
              className="rounded-xl"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setMessageDirty(true);
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => requestMutation.mutate()}
            disabled={!canSend || requestMutation.isPending}
            className="gap-2 rounded-xl bg-yas-midnight hover:bg-yas-midnight/90"
          >
            {requestMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Users className="size-4" />
            )}
            Envoyer la demande
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
