"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowUpDown,
  MoreHorizontal,
  Sparkles,
  ExternalLink,
  Trophy,
  X,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ApiError,
  applicationsApi,
  emploisApi,
  fileUrl,
  interviewRequestsApi,
  offersApi,
  usersApi,
} from "@/lib/api";
import { trackRhAction } from "@/lib/track-activity";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_ORDER,
  APPLICATION_TRANSITIONS,
  CONTRACT_TYPE_LABELS,
} from "@/lib/constants";
import type { Application, ApplicationStatus, ContractType } from "@/lib/types";
import {
  SoftCard,
  SoftPageHeader,
  SoftSearch,
  SoftStatusPill,
  SoftTabs,
  SoftToolbar,
  scoreTone,
  statusTone,
} from "@/components/shared/soft-ui";
import { AiRankingDialog } from "@/components/shared/ai-ranking-dialog";
import { cn } from "@/lib/utils";

function avatarInitials(name?: string | null, email?: string) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
  }
  return (email?.slice(0, 2) || "?").toUpperCase();
}

function RhCandidaturesContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const offerIdParam = searchParams.get("offerId");
  const offerId = offerIdParam ? Number(offerIdParam) : undefined;

  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">(
    "all"
  );
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"date" | "score">("date");
  const [selected, setSelected] = useState<number[]>([]);
  const [rankOpen, setRankOpen] = useState(false);
  const [mailOpen, setMailOpen] = useState(false);
  const [mailIds, setMailIds] = useState<number[]>([]);
  const [mailMessage, setMailMessage] = useState("");
  const [finalizeOpen, setFinalizeOpen] = useState(false);

  const [availabilityTarget, setAvailabilityTarget] = useState<Application | null>(null);
  const [availabilitySupervisorId, setAvailabilitySupervisorId] = useState("");

  const [emploiTarget, setEmploiTarget] = useState<Application | null>(null);
  const [emploiSupervisorId, setEmploiSupervisorId] = useState("");
  const [emploiDepartment, setEmploiDepartment] = useState("");
  const [emploiContractType, setEmploiContractType] = useState<ContractType>("cdi");
  const [emploiStartDate, setEmploiStartDate] = useState("");
  const [emploiEndDate, setEmploiEndDate] = useState("");

  const { data: applications, isLoading } = useQuery({
    queryKey: ["applications", "rh", offerId ?? "all"],
    queryFn: () => applicationsApi.list(offerId ? { offerId } : undefined),
  });

  const { data: offer } = useQuery({
    queryKey: ["offer", offerId],
    queryFn: () => offersApi.get(offerId!),
    enabled: Boolean(offerId),
  });

  const { data: supervisors } = useQuery({
    queryKey: ["users", "superviseur"],
    queryFn: () => usersApi.list("superviseur"),
  });

  useEffect(() => {
    setSelected([]);
  }, [offerId, statusFilter]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: applications?.length ?? 0 };
    for (const s of APPLICATION_STATUS_ORDER) map[s] = 0;
    for (const app of applications ?? []) {
      map[app.status] = (map[app.status] || 0) + 1;
    }
    return map;
  }, [applications]);

  const filtered = useMemo(() => {
    let list = applications ?? [];
    if (statusFilter !== "all") {
      list = list.filter((a) => a.status === statusFilter);
    }
    if (q.trim()) {
      const term = q.toLowerCase();
      list = list.filter((a) => {
        const hay = `${a.user?.fullName || ""} ${a.user?.email || ""} ${a.offer?.title || ""}`.toLowerCase();
        return hay.includes(term);
      });
    }
    list = [...list].sort((a, b) => {
      if (sort === "score") {
        return (b.aiMatchScore ?? -1) - (a.aiMatchScore ?? -1);
      }
      return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
    });
    return list;
  }, [applications, statusFilter, q, sort]);

  const activeStatuses: ApplicationStatus[] = [
    "envoyee",
    "en_cours_analyse",
    "preselectionnee",
    "entretien_programme",
    "entretien_realise",
  ];

  const othersToRejectCount = useMemo(() => {
    return (applications ?? []).filter(
      (a) => activeStatuses.includes(a.status) && !selected.includes(a.id)
    ).length;
  }, [applications, selected]);

  const finalizeMutation = useMutation({
    mutationFn: () => offersApi.finalizeSelection(offerId!, selected),
    onSuccess: (data) => {
      toast.success(data.message);
      if (data.failed.length > 0) {
        toast.message(`${data.failed.length} candidature(s) non traitée(s)`);
      }
      setFinalizeOpen(false);
      setSelected([]);
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "Finalisation impossible"
      );
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ApplicationStatus }) =>
      applicationsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Statut mis à jour");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "Mise à jour impossible"
      );
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: (id: number) => applicationsApi.aiAnalyze(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Analyse IA terminée");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "Analyse impossible"
      );
    },
  });

  const notifyMutation = useMutation({
    mutationFn: () =>
      applicationsApi.notifySelected(
        mailIds,
        mailMessage.trim() || undefined
      ),
    onSuccess: (data) => {
      toast.success(data.message || "Email(s) envoyé(s)");
      if (data.failedCount > 0) {
        toast.message(`${data.failedCount} envoi(s) en échec`);
      }
      setMailOpen(false);
      setMailMessage("");
      setMailIds([]);
      setSelected([]);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "Envoi impossible"
      );
    },
  });

  const availabilityMutation = useMutation({
    mutationFn: () =>
      interviewRequestsApi.create({
        applicationId: availabilityTarget!.id,
        supervisorId: Number(availabilitySupervisorId),
      }),
    onSuccess: () => {
      toast.success("Demande de disponibilité envoyée au superviseur");
      setAvailabilityTarget(null);
      setAvailabilitySupervisorId("");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Envoi impossible");
    },
  });

  const emploiMutation = useMutation({
    mutationFn: () =>
      emploisApi.create({
        applicationId: emploiTarget!.id,
        supervisorId: Number(emploiSupervisorId),
        department: emploiDepartment.trim() || undefined,
        contractType: emploiContractType,
        startDate: new Date(emploiStartDate).toISOString(),
        endDate: emploiEndDate ? new Date(emploiEndDate).toISOString() : undefined,
      }),
    onSuccess: () => {
      toast.success("Dossier Emploi créé");
      setEmploiTarget(null);
      setEmploiSupervisorId("");
      setEmploiDepartment("");
      setEmploiStartDate("");
      setEmploiEndDate("");
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Création impossible");
    },
  });

  const mailTargets = useMemo(() => {
    return (applications ?? []).filter((a) => mailIds.includes(a.id));
  }, [applications, mailIds]);

  function openMailDialog(ids: number[]) {
    setMailIds(ids);
    setMailMessage("");
    setMailOpen(true);
    trackRhAction(
      "ui.open_email_dialog",
      `Ouverture du dialog d’envoi email (${ids.length} candidature${ids.length > 1 ? "s" : ""})`,
      { category: "ui", metadata: { applicationIds: ids } }
    );
  }

  const allChecked =
    filtered.length > 0 && filtered.every((a) => selected.includes(a.id));

  function toggleAll(checked: boolean) {
    setSelected(checked ? filtered.map((a) => a.id) : []);
  }

  function toggleOne(id: number, checked: boolean) {
    setSelected((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  }

  const tabs = [
    { value: "all", label: "Tous", count: counts.all },
    { value: "envoyee", label: "Nouvelles", count: counts.envoyee },
    {
      value: "en_cours_analyse",
      label: "En analyse",
      count: counts.en_cours_analyse,
    },
    {
      value: "preselectionnee",
      label: "Présélection",
      count: counts.preselectionnee,
    },
    {
      value: "entretien_programme",
      label: "Entretien programmé",
      count: counts.entretien_programme,
    },
    {
      value: "entretien_realise",
      label: "Entretien réalisé",
      count: counts.entretien_realise,
    },
    { value: "acceptee", label: "Acceptées", count: counts.acceptee },
    { value: "rejetee", label: "Rejetées", count: counts.rejetee },
  ];

  return (
    <div>
      <SoftPageHeader
        title="Candidatures"
        description={
          offer
            ? `Candidats pour « ${offer.title} »`
            : "Gérez et collaborez sur le pipeline de recrutement Yas Togo."
        }
        action={
          <Button
            onClick={() => {
              setRankOpen(true);
              trackRhAction(
                "ui.open_ai_ranking",
                "Ouverture du classement IA des candidatures",
                { category: "ui" }
              );
            }}
            className="h-10 gap-2 rounded-xl bg-yas-midnight px-4 text-white hover:bg-yas-midnight/90"
          >
            <Trophy className="size-4 text-yas-yellow" />
            Classement IA
          </Button>
        }
      />

      {offerId && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-yas-sky/30 bg-yas-sky/10 px-4 py-2.5 text-sm text-yas-midnight">
          <span>
            Filtre offre #{offerId}
            {offer ? ` — ${offer.title}` : ""}
          </span>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-7 gap-1 rounded-lg px-2"
          >
            <Link href="/rh/candidatures">
              <X className="size-3.5" />
              Retirer le filtre
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="h-7 rounded-lg px-2">
            <Link href={`/rh/offres/${offerId}`}>Voir l&apos;offre</Link>
          </Button>
          <Button
            size="sm"
            className="h-7 gap-1.5 rounded-lg bg-emerald-600 px-2.5 text-white hover:bg-emerald-600/90"
            onClick={() => setFinalizeOpen(true)}
          >
            <CheckCircle2 className="size-3.5" />
            Finaliser la sélection
          </Button>
        </div>
      )}

      <SoftToolbar>
        <SoftTabs
          items={tabs}
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as ApplicationStatus | "all")}
        />
        <div className="flex flex-wrap items-center gap-2">
          <SoftSearch
            value={q}
            onChange={setQ}
            placeholder="Nom, email, offre…"
          />
          <Select
            value={sort}
            onValueChange={(v) => setSort(v as "date" | "score")}
          >
            <SelectTrigger className="h-10 w-[150px] rounded-xl border-border/80 bg-white">
              <ArrowUpDown className="mr-1 size-3.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Plus récentes</SelectItem>
              <SelectItem value="score">Score IA</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SoftToolbar>

      <SoftCard className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs text-slate-500">
                <th className="w-12 px-4 py-3">
                  <Checkbox
                    checked={allChecked}
                    onCheckedChange={(c) => toggleAll(c === true)}
                    aria-label="Tout sélectionner"
                  />
                </th>
                <th className="px-3 py-3 font-medium">Candidat</th>
                <th className="px-3 py-3 font-medium">Date</th>
                <th className="px-3 py-3 font-medium">Offre</th>
                <th className="px-3 py-3 font-medium">Type</th>
                <th className="px-3 py-3 font-medium">Score IA</th>
                <th className="px-3 py-3 font-medium">Statut</th>
                <th className="w-12 px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-16 text-center text-muted-foreground"
                  >
                    Chargement des candidatures…
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-16 text-center text-muted-foreground"
                  >
                    Aucune candidature dans ce filtre.
                  </td>
                </tr>
              )}
              {filtered.map((app) => {
                const name = app.user?.fullName || "Candidat";
                return (
                  <tr
                    key={app.id}
                    className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/70"
                  >
                    <td className="px-4 py-3.5">
                      <Checkbox
                        checked={selected.includes(app.id)}
                        onCheckedChange={(c) => toggleOne(app.id, c === true)}
                        aria-label={`Sélectionner ${name}`}
                      />
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9 bg-yas-sky/15">
                          <AvatarFallback className="bg-yas-sky/15 text-xs font-semibold text-yas-midnight">
                            {avatarInitials(app.user?.fullName, app.user?.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-800">
                            {name}
                          </p>
                          <p className="truncate text-xs text-slate-400">
                            {app.user?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap text-slate-500">
                      {new Date(app.appliedAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="max-w-[200px] truncate px-3 py-3.5 text-foreground">
                      {app.offer?.title || "—"}
                    </td>
                    <td className="px-3 py-3.5 text-muted-foreground capitalize">
                      {app.offer?.type === "stage" ? "Stage" : "Emploi"}
                    </td>
                    <td className="px-3 py-3.5">
                      {app.aiMatchScore != null ? (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 font-semibold tabular-nums",
                            scoreTone(app.aiMatchScore)
                          )}
                          title={app.aiSummary || undefined}
                        >
                          <Sparkles className="size-3.5 opacity-70" />
                          {app.aiMatchScore}
                        </span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 rounded-lg text-xs"
                          onClick={() => analyzeMutation.mutate(app.id)}
                          disabled={analyzeMutation.isPending}
                        >
                          Analyser
                        </Button>
                      )}
                    </td>
                    <td className="px-3 py-3.5">
                      <Select
                        value={app.status}
                        onValueChange={(v) =>
                          statusMutation.mutate({
                            id: app.id,
                            status: v as ApplicationStatus,
                          })
                        }
                      >
                        <SelectTrigger className="h-8 w-[160px] rounded-full border-0 bg-slate-100 px-3 text-xs font-medium shadow-none">
                          <SelectValue>
                            <SoftStatusPill tone={statusTone(app.status)}>
                              {APPLICATION_STATUS_LABELS[app.status]}
                            </SoftStatusPill>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={app.status}>
                            {APPLICATION_STATUS_LABELS[app.status]}
                          </SelectItem>
                          {APPLICATION_TRANSITIONS[app.status].map((s) => (
                            <SelectItem key={s} value={s}>
                              {APPLICATION_STATUS_LABELS[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-3 py-3.5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-lg"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {app.cvUrl && (
                            <DropdownMenuItem asChild>
                              <a
                                href={fileUrl(app.cvUrl)!}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <ExternalLink className="size-4" />
                                Voir le CV
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => analyzeMutation.mutate(app.id)}
                          >
                            <Sparkles className="size-4" />
                            Relancer l&apos;IA
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openMailDialog([app.id])}
                          >
                            <Mail className="size-4" />
                            Envoyer un email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {APPLICATION_TRANSITIONS[app.status].includes(
                            "entretien_programme"
                          ) && (
                            <DropdownMenuItem
                              onClick={() =>
                                statusMutation.mutate({
                                  id: app.id,
                                  status: "entretien_programme",
                                })
                              }
                            >
                              Marquer entretien
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              setAvailabilityTarget(app);
                              setAvailabilitySupervisorId("");
                            }}
                          >
                            Demander une disponibilité
                          </DropdownMenuItem>
                          {app.status === "acceptee" && (
                            <DropdownMenuItem
                              onClick={() => {
                                setEmploiTarget(app);
                                setEmploiSupervisorId("");
                                setEmploiDepartment("");
                                setEmploiContractType("cdi");
                                setEmploiStartDate("");
                                setEmploiEndDate("");
                              }}
                            >
                              Créer le dossier Emploi
                            </DropdownMenuItem>
                          )}
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

      {selected.length > 0 && (
        <div className="sticky bottom-4 z-10 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-yas-sky/30 bg-white px-4 py-3 shadow-lg shadow-yas-midnight/10">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-yas-midnight">
              {selected.length}
            </span>{" "}
            candidature{selected.length > 1 ? "s" : ""} sélectionnée
            {selected.length > 1 ? "s" : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="h-9 rounded-xl"
              onClick={() => setSelected([])}
            >
              Annuler
            </Button>
            <Button
              className="h-9 gap-2 rounded-xl bg-yas-midnight text-white hover:bg-yas-midnight/90"
              onClick={() => openMailDialog(selected)}
            >
              <Mail className="size-4" />
              Envoyer un email
            </Button>
          </div>
        </div>
      )}

      <Dialog open={finalizeOpen} onOpenChange={setFinalizeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Finaliser la sélection</DialogTitle>
            <DialogDescription>
              Pour « {offer?.title ?? `offre #${offerId}`} »
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p>
              <span className="font-semibold text-emerald-700">
                {selected.length} candidature{selected.length > 1 ? "s" : ""}
              </span>{" "}
              {selected.length > 1 ? "seront acceptées" : "sera acceptée"}.
            </p>
            <p>
              <span className="font-semibold text-destructive">
                {othersToRejectCount} autre{othersToRejectCount > 1 ? "s" : ""}{" "}
                candidature{othersToRejectCount > 1 ? "s" : ""}
              </span>{" "}
              actuellement active{othersToRejectCount > 1 ? "s" : ""} pour cette
              offre {othersToRejectCount > 1 ? "seront automatiquement rejetées" : "sera automatiquement rejetée"}{" "}
              et {othersToRejectCount > 1 ? "notifiées" : "notifiée"} par email.
            </p>
            {selected.length === 0 && (
              <p className="rounded-lg bg-amber-50 p-2.5 text-amber-800">
                Aucune candidature sélectionnée — tous les candidats encore
                actifs pour cette offre seront rejetés.
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Les candidatures déjà acceptées ou rejetées ne sont pas
              concernées. Cette action est journalisée.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setFinalizeOpen(false)}
              disabled={finalizeMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              className="rounded-xl bg-emerald-600 hover:bg-emerald-600/90"
              onClick={() => finalizeMutation.mutate()}
              disabled={finalizeMutation.isPending}
            >
              {finalizeMutation.isPending ? "Traitement…" : "Confirmer la finalisation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={mailOpen} onOpenChange={setMailOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Envoyer un email au candidat</DialogTitle>
            <DialogDescription>
              Le message inclura automatiquement l’offre, le statut du dossier
              et les infos d’entretien s’il y en a.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Destinataire{mailTargets.length > 1 ? "s" : ""} (
              {mailTargets.length})
            </p>
            <ul className="max-h-28 space-y-1.5 overflow-y-auto text-sm">
              {mailTargets.map((app: Application) => (
                <li key={app.id} className="truncate text-slate-700">
                  <span className="font-medium">
                    {app.user?.fullName || "Candidat"}
                  </span>
                  <span className="text-slate-400"> — {app.user?.email}</span>
                  {app.offer?.title ? (
                    <span className="block truncate text-xs text-slate-400">
                      {app.offer.title} ·{" "}
                      {APPLICATION_STATUS_LABELS[app.status]}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rh-mail-message">
              Message personnalisé (optionnel)
            </Label>
            <Textarea
              id="rh-mail-message"
              rows={5}
              value={mailMessage}
              onChange={(e) => setMailMessage(e.target.value)}
              placeholder="Ex. Félicitations, nous souhaitons vous rencontrer… / Merci pour votre candidature, voici la suite…"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setMailOpen(false)}
              disabled={notifyMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              className="gap-2 rounded-xl bg-yas-midnight text-white hover:bg-yas-midnight/90"
              onClick={() => notifyMutation.mutate()}
              disabled={notifyMutation.isPending || mailIds.length === 0}
            >
              <Mail className="size-4" />
              {notifyMutation.isPending ? "Envoi…" : "Envoyer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AiRankingDialog
        open={rankOpen}
        onOpenChange={setRankOpen}
        initialOfferId={offerId}
      />

      <Dialog
        open={Boolean(availabilityTarget)}
        onOpenChange={(open) => !open && setAvailabilityTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Demander une disponibilité</DialogTitle>
            <DialogDescription>
              Un email sera envoyé au superviseur pour confirmer sa
              disponibilité avant de programmer l&apos;entretien avec{" "}
              {availabilityTarget?.user?.fullName || availabilityTarget?.user?.email}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Superviseur</Label>
            <Select value={availabilitySupervisorId} onValueChange={setAvailabilitySupervisorId}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Choisir un superviseur" />
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
          <DialogFooter>
            <Button
              className="rounded-xl bg-yas-midnight hover:bg-yas-midnight/90"
              onClick={() => availabilityMutation.mutate()}
              disabled={!availabilitySupervisorId || availabilityMutation.isPending}
            >
              {availabilityMutation.isPending ? "Envoi…" : "Envoyer la demande"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(emploiTarget)}
        onOpenChange={(open) => !open && setEmploiTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Créer le dossier Emploi</DialogTitle>
            <DialogDescription>
              Affecte {emploiTarget?.user?.fullName || emploiTarget?.user?.email} à
              un superviseur pour le suivi post-recrutement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Superviseur</Label>
              <Select value={emploiSupervisorId} onValueChange={setEmploiSupervisorId}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Choisir un superviseur" />
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
            <div className="space-y-2">
              <Label>Type de contrat</Label>
              <Select
                value={emploiContractType}
                onValueChange={(v) => setEmploiContractType(v as ContractType)}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CONTRACT_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emploi-department">Département (optionnel)</Label>
              <Input
                id="emploi-department"
                className="rounded-xl"
                value={emploiDepartment}
                onChange={(e) => setEmploiDepartment(e.target.value)}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="emploi-start">Date de début</Label>
                <Input
                  id="emploi-start"
                  type="date"
                  className="rounded-xl"
                  value={emploiStartDate}
                  onChange={(e) => setEmploiStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emploi-end">Date de fin (optionnel)</Label>
                <Input
                  id="emploi-end"
                  type="date"
                  className="rounded-xl"
                  value={emploiEndDate}
                  onChange={(e) => setEmploiEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              className="rounded-xl bg-yas-midnight hover:bg-yas-midnight/90"
              onClick={() => emploiMutation.mutate()}
              disabled={
                !emploiSupervisorId || !emploiStartDate || emploiMutation.isPending
              }
            >
              {emploiMutation.isPending ? "Création…" : "Créer le dossier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function RhCandidaturesPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-sm text-slate-400">
          Chargement…
        </div>
      }
    >
      <RhCandidaturesContent />
    </Suspense>
  );
}
