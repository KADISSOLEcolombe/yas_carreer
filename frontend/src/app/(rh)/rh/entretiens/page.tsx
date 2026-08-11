"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  MoreHorizontal,
  Plus,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ApiError, applicationsApi, interviewsApi, usersApi } from "@/lib/api";
import { trackRhAction } from "@/lib/track-activity";
import {
  INTERVIEW_MODE_LABELS,
  INTERVIEW_STATUS_LABELS,
} from "@/lib/constants";
import type { Interview, InterviewMode, InterviewStatus } from "@/lib/types";
import {
  SoftCard,
  SoftPageHeader,
  SoftStatusPill,
  SoftTabs,
  statusTone,
} from "@/components/shared/soft-ui";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

/** Grille calendrier lundi → dimanche (6 semaines max). */
function buildMonthCells(month: Date): (Date | null)[] {
  const first = startOfMonth(month);
  // JS: 0=dim … 6=sam → convertir en lundi=0
  const mondayIndex = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0
  ).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < mondayIndex; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function RhEntretiensPage() {
  const queryClient = useQueryClient();
  const todayKey = toDateKey(new Date());

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<InterviewStatus | "all">("all");
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedKey, setSelectedKey] = useState(todayKey);

  const [applicationId, setApplicationId] = useState("");
  const [supervisorId, setSupervisorId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("30");
  const [mode, setMode] = useState<InterviewMode>("distanciel");
  const [location, setLocation] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [notes, setNotes] = useState("");

  const { data: interviews, isLoading } = useQuery({
    queryKey: ["interviews", "rh"],
    queryFn: interviewsApi.list,
  });

  const { data: applications } = useQuery({
    queryKey: ["applications", "rh", "all"],
    queryFn: () => applicationsApi.list(),
  });

  const { data: supervisors } = useQuery({
    queryKey: ["users", "superviseur"],
    queryFn: () => usersApi.list("superviseur"),
  });

  const eligibleApplications = applications?.filter(
    (a) => a.status !== "acceptee" && a.status !== "rejetee"
  );

  const statusFiltered = useMemo(() => {
    let list = interviews ?? [];
    if (tab !== "all") list = list.filter((i) => i.status === tab);
    return list;
  }, [interviews, tab]);

  const byDate = useMemo(() => {
    const map = new Map<string, Interview[]>();
    for (const interview of statusFiltered) {
      const key = toDateKey(new Date(interview.scheduledAt));
      const bucket = map.get(key) ?? [];
      bucket.push(interview);
      map.set(key, bucket);
    }
    for (const [, list] of map) {
      list.sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      );
    }
    return map;
  }, [statusFiltered]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {
      all: interviews?.length ?? 0,
      planifie: 0,
      termine: 0,
      annule: 0,
    };
    for (const i of interviews ?? []) map[i.status] = (map[i.status] || 0) + 1;
    return map;
  }, [interviews]);

  const cells = useMemo(() => buildMonthCells(month), [month]);
  const selectedInterviews = byDate.get(selectedKey) ?? [];
  const selectedDate = parseDateKey(selectedKey);

  const monthLabel = month.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  const scheduleMutation = useMutation({
    mutationFn: () =>
      interviewsApi.create({
        applicationId: Number(applicationId),
        supervisorId: supervisorId ? Number(supervisorId) : undefined,
        scheduledAt: new Date(scheduledAt).toISOString(),
        durationMinutes: Number(durationMinutes) || 30,
        mode,
        location: mode === "presentiel" ? location || undefined : undefined,
        meetingLink: mode === "distanciel" ? meetingLink || undefined : undefined,
        notes: notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Entretien programmé");
      if (scheduledAt) {
        setSelectedKey(toDateKey(new Date(scheduledAt)));
        setMonth(startOfMonth(new Date(scheduledAt)));
      }
      setOpen(false);
      setApplicationId("");
      setSupervisorId("");
      setScheduledAt("");
      setDurationMinutes("30");
      setLocation("");
      setMeetingLink("");
      setNotes("");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "Programmation impossible"
      );
    },
  });

  const tabs = [
    { value: "all", label: "Tous", count: counts.all },
    { value: "planifie", label: "Planifiés", count: counts.planifie },
    { value: "termine", label: "Terminés", count: counts.termine },
    { value: "annule", label: "Annulés", count: counts.annule },
  ];

  const monthInterviewCount = useMemo(() => {
    let n = 0;
    for (const [key, list] of byDate) {
      const d = parseDateKey(key);
      if (
        d.getFullYear() === month.getFullYear() &&
        d.getMonth() === month.getMonth()
      ) {
        n += list.length;
      }
    }
    return n;
  }, [byDate, month]);

  return (
    <div>
      <SoftPageHeader
        title="Entretiens"
        description="Calendrier des rendez-vous — cliquez une date pour voir les entretiens du jour."
        action={
          <Dialog
            open={open}
            onOpenChange={(next) => {
              setOpen(next);
              if (next) {
                trackRhAction(
                  "ui.open_schedule_interview",
                  "Ouverture du dialog de programmation d’entretien",
                  { category: "ui" }
                );
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="h-10 gap-2 rounded-xl bg-yas-midnight px-4 text-white hover:bg-yas-midnight/90">
                <Plus className="size-4" />
                Programmer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Programmer un entretien</DialogTitle>
                <DialogDescription>
                  Le candidat sera notifié par email et notification in-app.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Candidature</Label>
                  <Select
                    value={applicationId}
                    onValueChange={setApplicationId}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Choisir une candidature" />
                    </SelectTrigger>
                    <SelectContent>
                      {eligibleApplications?.map((app) => (
                        <SelectItem key={app.id} value={String(app.id)}>
                          {app.user?.fullName || app.user?.email} —{" "}
                          {app.offer?.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Superviseur (optionnel)</Label>
                  <Select value={supervisorId} onValueChange={setSupervisorId}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Aucun superviseur" />
                    </SelectTrigger>
                    <SelectContent>
                      {supervisors?.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.fullName || s.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="scheduledAt">Date et heure</Label>
                    <Input
                      id="scheduledAt"
                      type="datetime-local"
                      className="rounded-xl"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="durationMinutes">Durée (minutes)</Label>
                    <Input
                      id="durationMinutes"
                      type="number"
                      min={5}
                      max={480}
                      step={5}
                      className="rounded-xl"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Type d&apos;entretien</Label>
                  <Select
                    value={mode}
                    onValueChange={(v) => setMode(v as InterviewMode)}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="distanciel">Visio</SelectItem>
                      <SelectItem value="presentiel">Présentiel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {mode === "presentiel" ? (
                  <div className="space-y-2">
                    <Label htmlFor="location">Lieu</Label>
                    <Input
                      id="location"
                      className="rounded-xl"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Ex. Bureau Yas Togo, salle 2"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="meetingLink">Lien visio (optionnel)</Label>
                    <Input
                      id="meetingLink"
                      className="rounded-xl"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      placeholder="https://meet.google.com/..."
                    />
                    <p className="text-xs text-slate-400">
                      Génération automatique à venir — collez ici votre lien
                      Google Meet en attendant.
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    rows={2}
                    className="rounded-xl"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => scheduleMutation.mutate()}
                  disabled={
                    !applicationId ||
                    !scheduledAt ||
                    (mode === "presentiel" && !location.trim()) ||
                    scheduleMutation.isPending
                  }
                  className="rounded-xl bg-yas-midnight hover:bg-yas-midnight/90"
                >
                  {scheduleMutation.isPending
                    ? "Programmation…"
                    : "Programmer"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-4">
        <SoftTabs
          items={tabs}
          value={tab}
          onChange={(v) => setTab(v as InterviewStatus | "all")}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        {/* Calendrier */}
        <SoftCard className="!p-0 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
            <div>
              <h2 className="font-heading text-lg font-semibold capitalize text-yas-midnight">
                {monthLabel}
              </h2>
              <p className="text-xs text-slate-400">
                {monthInterviewCount} entretien
                {monthInterviewCount > 1 ? "s" : ""} ce mois
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-9 rounded-xl border-slate-200"
                onClick={() => setMonth((m) => addMonths(m, -1))}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-xl border-slate-200 px-3 text-xs font-semibold"
                onClick={() => {
                  const now = startOfMonth(new Date());
                  setMonth(now);
                  setSelectedKey(todayKey);
                }}
              >
                Aujourd&apos;hui
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-9 rounded-xl border-slate-200"
                onClick={() => setMonth((m) => addMonths(m, 1))}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          <div className="p-3 sm:p-4">
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
              {WEEKDAYS.map((d) => (
                <div
                  key={d}
                  className="py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-[11px]"
                >
                  <span className="sm:hidden">{d.charAt(0)}</span>
                  <span className="hidden sm:inline">{d}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
              {cells.map((date, idx) => {
                if (!date) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="aspect-square rounded-lg bg-transparent sm:min-h-[72px] sm:rounded-xl sm:aspect-auto"
                    />
                  );
                }
                const key = toDateKey(date);
                const dayInterviews = byDate.get(key) ?? [];
                const count = dayInterviews.length;
                const isSelected = key === selectedKey;
                const isToday = key === todayKey;
                const hasPlanifie = dayInterviews.some(
                  (i) => i.status === "planifie"
                );

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedKey(key)}
                    className={cn(
                      "flex aspect-square min-h-0 flex-col items-start rounded-lg border p-1 text-left transition sm:aspect-auto sm:min-h-[78px] sm:rounded-xl sm:p-2",
                      isSelected
                        ? "border-yas-midnight bg-yas-midnight text-white shadow-md"
                        : count > 0
                          ? "border-yas-sky/25 bg-yas-sky/5 hover:border-yas-sky/50 hover:bg-yas-sky/10"
                          : "border-transparent bg-slate-50/80 hover:bg-slate-100",
                      isToday && !isSelected && "ring-1 ring-yas-yellow"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-6 items-center justify-center rounded-md text-xs font-semibold sm:size-7 sm:rounded-lg sm:text-sm",
                        isSelected
                          ? "bg-white/15 text-white"
                          : isToday
                            ? "bg-yas-yellow text-yas-midnight"
                            : "text-slate-700"
                      )}
                    >
                      {date.getDate()}
                    </span>
                    {count > 0 && (
                      <div className="mt-auto hidden w-full flex-col gap-0.5 pt-1 sm:flex">
                        <span
                          className={cn(
                            "text-[10px] font-semibold tabular-nums",
                            isSelected ? "text-yas-yellow" : "text-yas-sky"
                          )}
                        >
                          {count} RDV
                        </span>
                        <div className="flex gap-0.5">
                          {dayInterviews.slice(0, 3).map((i) => (
                            <span
                              key={i.id}
                              className={cn(
                                "h-1 flex-1 rounded-full",
                                isSelected
                                  ? "bg-yas-yellow/80"
                                  : i.status === "planifie"
                                    ? "bg-yas-sky"
                                    : i.status === "termine"
                                      ? "bg-emerald-400"
                                      : "bg-slate-300"
                              )}
                            />
                          ))}
                        </div>
                        {hasPlanifie && !isSelected && (
                          <span className="sr-only">Entretiens planifiés</span>
                        )}
                      </div>
                    )}
                    {count > 0 && (
                      <span
                        className={cn(
                          "mt-auto size-1.5 rounded-full sm:hidden",
                          isSelected ? "bg-yas-yellow" : "bg-yas-sky"
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </SoftCard>

        {/* Détail du jour */}
        <SoftCard className="flex flex-col !p-0 overflow-hidden xl:min-h-[520px]">
          <div className="border-b border-slate-100 bg-gradient-to-br from-yas-midnight to-[#002456] px-5 py-4 text-white">
            <p className="text-xs font-medium uppercase tracking-wider text-white/55">
              Jour sélectionné
            </p>
            <h2 className="mt-1 font-heading text-xl font-semibold capitalize">
              {selectedDate.toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h2>
            <p className="mt-1 text-sm text-yas-yellow">
              {selectedInterviews.length} entretien
              {selectedInterviews.length > 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {isLoading && (
              <p className="py-10 text-center text-sm text-slate-400">
                Chargement…
              </p>
            )}

            {!isLoading && selectedInterviews.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-12 text-center">
                <p className="font-heading text-base text-yas-midnight">
                  Aucun entretien ce jour
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Choisissez une autre date ou programmez un RDV.
                </p>
                <Button
                  type="button"
                  className="mt-4 gap-2 rounded-xl bg-yas-midnight"
                  onClick={() => {
                    setScheduledAt(`${selectedKey}T10:00`);
                    setOpen(true);
                    trackRhAction(
                      "ui.open_schedule_interview",
                      `Ouverture programmation entretien pour le ${selectedKey}`,
                      { category: "ui", metadata: { date: selectedKey } }
                    );
                  }}
                >
                  <Plus className="size-4" />
                  Programmer ce jour
                </Button>
              </div>
            )}

            {selectedInterviews.map((interview) => {
              const name =
                interview.application?.user?.fullName ||
                interview.application?.user?.email ||
                "—";
              const ini = name
                .split(/\s+/)
                .map((p) => p[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              const time = new Date(interview.scheduledAt).toLocaleTimeString(
                "fr-FR",
                { hour: "2-digit", minute: "2-digit" }
              );

              return (
                <div
                  key={interview.id}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-yas-sky/30"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 flex-col items-center justify-center rounded-xl bg-yas-midnight text-white">
                        <span className="text-[10px] font-medium uppercase opacity-70">
                          Heure
                        </span>
                        <span className="text-sm font-bold tabular-nums">
                          {time}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Avatar className="size-8">
                            <AvatarFallback className="bg-yas-yellow/40 text-[10px] font-semibold text-yas-midnight">
                              {ini}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-800">
                              {name}
                            </p>
                            <p className="truncate text-xs text-slate-400">
                              {interview.application?.offer?.title}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 shrink-0 rounded-lg"
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {interview.meetingLink && (
                          <DropdownMenuItem asChild>
                            <a
                              href={interview.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Ouvrir le lien
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem disabled>
                          Notes : {interview.notes || "—"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <SoftStatusPill tone={statusTone(interview.status)}>
                      {INTERVIEW_STATUS_LABELS[interview.status]}
                    </SoftStatusPill>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                      {interview.mode === "distanciel" ? (
                        <Video className="size-3" />
                      ) : (
                        <MapPin className="size-3" />
                      )}
                      {INTERVIEW_MODE_LABELS[interview.mode]}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                      {interview.durationMinutes} min
                    </span>
                    {interview.mode === "presentiel" && interview.location && (
                      <span className="inline-flex items-center gap-1 truncate rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                        <MapPin className="size-3" />
                        {interview.location}
                      </span>
                    )}
                  </div>

                  {interview.meetingLink && (
                    <a
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex h-9 items-center gap-2 rounded-xl bg-yas-sky/10 px-3 text-xs font-semibold text-yas-midnight transition hover:bg-yas-sky/20"
                    >
                      <Video className="size-3.5" />
                      Rejoindre la visio
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </SoftCard>
      </div>
    </div>
  );
}
