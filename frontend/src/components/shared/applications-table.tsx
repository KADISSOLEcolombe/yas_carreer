"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ExternalLink,
  Mail,
  MoreHorizontal,
  Sparkles,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { ApiError, applicationsApi, emploisApi, fileUrl, usersApi } from "@/lib/api";
import { APPLICATION_STATUS_LABELS, CONTRACT_TYPE_LABELS } from "@/lib/constants";
import type { Application, ContractType } from "@/lib/types";
import { SoftCard, SoftStatusPill, scoreTone, statusTone } from "@/components/shared/soft-ui";
import { cn } from "@/lib/utils";

function avatarInitials(name?: string | null, email?: string) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
  }
  return (email?.slice(0, 2) || "?").toUpperCase();
}

/**
 * Table interactive des candidatures (sélection, score IA, statut, actions) —
 * self-contenue : possède ses propres dialogs (email, disponibilité, dossier
 * Emploi) et mutations, pour être embarquée telle quelle sur plusieurs pages
 * (liste générale RH, page d'une offre précise) sans dupliquer ce code.
 */
export function ApplicationsTable({
  applications,
  isLoading,
  hideOfferColumn = false,
  emptyMessage = "Aucune candidature dans ce filtre.",
  onSelectionChange,
}: {
  applications: Application[];
  isLoading?: boolean;
  hideOfferColumn?: boolean;
  emptyMessage?: string;
  onSelectionChange?: (ids: number[]) => void;
}) {
  const queryClient = useQueryClient();

  const [selected, setSelected] = useState<number[]>([]);
  const [mailOpen, setMailOpen] = useState(false);
  const [mailIds, setMailIds] = useState<number[]>([]);
  const [mailMessage, setMailMessage] = useState("");

  const [emploiTarget, setEmploiTarget] = useState<Application | null>(null);
  const [emploiSupervisorId, setEmploiSupervisorId] = useState("");
  const [emploiDepartment, setEmploiDepartment] = useState("");
  const [emploiContractType, setEmploiContractType] = useState<ContractType>("cdi");
  const [emploiStartDate, setEmploiStartDate] = useState("");
  const [emploiEndDate, setEmploiEndDate] = useState("");

  useEffect(() => {
    onSelectionChange?.(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  useEffect(() => {
    setSelected((prev) =>
      prev.filter((id) => applications.some((a) => a.id === id))
    );
  }, [applications]);

  const { data: supervisors } = useQuery({
    queryKey: ["users", "superviseur"],
    queryFn: () => usersApi.list("superviseur"),
  });

  const analyzeMutation = useMutation({
    mutationFn: (id: number) => applicationsApi.aiAnalyze(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Analyse IA terminée");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Analyse impossible");
    },
  });

  const mailTargets = useMemo(
    () => applications.filter((a) => mailIds.includes(a.id)),
    [applications, mailIds]
  );

  function openMailDialog(ids: number[]) {
    setMailIds(ids);
    setMailMessage("");
    setMailOpen(true);
  }

  const notifyMutation = useMutation({
    mutationFn: () =>
      applicationsApi.notifySelected(mailIds, mailMessage.trim() || undefined),
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

  const allChecked =
    applications.length > 0 && applications.every((a) => selected.includes(a.id));

  function toggleAll(checked: boolean) {
    setSelected(checked ? applications.map((a) => a.id) : []);
  }

  function toggleOne(id: number, checked: boolean) {
    setSelected((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  }

  const columnCount = hideOfferColumn ? 7 : 8;

  return (
    <>
      <SoftCard className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
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
                {!hideOfferColumn && <th className="px-3 py-3 font-medium">Offre</th>}
                <th className="px-3 py-3 font-medium">Type</th>
                <th className="px-3 py-3 font-medium">Score IA</th>
                <th className="px-3 py-3 font-medium">Statut</th>
                <th className="w-12 px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={columnCount} className="px-4 py-16 text-center text-muted-foreground">
                    Chargement des candidatures…
                  </td>
                </tr>
              )}
              {!isLoading && applications.length === 0 && (
                <tr>
                  <td colSpan={columnCount} className="px-4 py-16 text-center text-muted-foreground">
                    {emptyMessage}
                  </td>
                </tr>
              )}
              {applications.map((app) => {
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
                      <Link
                        href={`/rh/candidatures/${app.id}`}
                        className="flex items-center gap-3"
                      >
                        <Avatar className="size-9 bg-yas-sky/15">
                          <AvatarFallback className="bg-yas-sky/15 text-xs font-semibold text-yas-midnight">
                            {avatarInitials(app.user?.fullName, app.user?.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-800 hover:underline">
                            {name}
                          </p>
                          <p className="truncate text-xs text-slate-400">{app.user?.email}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap text-slate-500">
                      {new Date(app.appliedAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    {!hideOfferColumn && (
                      <td className="max-w-[200px] truncate px-3 py-3.5 text-foreground">
                        {app.offer?.title || "—"}
                      </td>
                    )}
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
                      <Link href={`/rh/candidatures/${app.id}`}>
                        <SoftStatusPill tone={statusTone(app.status)}>
                          {APPLICATION_STATUS_LABELS[app.status]}
                        </SoftStatusPill>
                      </Link>
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
                            <Link href={`/rh/candidatures/${app.id}`}>
                              <ExternalLink className="size-4" />
                              Ouvrir le dossier
                            </Link>
                          </DropdownMenuItem>
                          {app.cvUrl && (
                            <DropdownMenuItem asChild>
                              <a href={fileUrl(app.cvUrl)!} target="_blank" rel="noreferrer">
                                <ExternalLink className="size-4" />
                                Voir le CV
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => analyzeMutation.mutate(app.id)}>
                            <Sparkles className="size-4" />
                            Relancer l&apos;IA
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openMailDialog([app.id])}>
                            <Mail className="size-4" />
                            Envoyer un email
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
            <span className="font-semibold text-yas-midnight">{selected.length}</span>{" "}
            candidature{selected.length > 1 ? "s" : ""} sélectionnée
            {selected.length > 1 ? "s" : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="h-9 rounded-xl" onClick={() => setSelected([])}>
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
              Destinataire{mailTargets.length > 1 ? "s" : ""} ({mailTargets.length})
            </p>
            <ul className="max-h-28 space-y-1.5 overflow-y-auto text-sm">
              {mailTargets.map((app) => (
                <li key={app.id} className="truncate text-slate-700">
                  <span className="font-medium">{app.user?.fullName || "Candidat"}</span>
                  <span className="text-slate-400"> — {app.user?.email}</span>
                  {app.offer?.title ? (
                    <span className="block truncate text-xs text-slate-400">
                      {app.offer.title} · {APPLICATION_STATUS_LABELS[app.status]}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rh-mail-message">Message personnalisé (optionnel)</Label>
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


      <Dialog open={Boolean(emploiTarget)} onOpenChange={(open) => !open && setEmploiTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Créer le dossier Emploi</DialogTitle>
            <DialogDescription>
              Affecte {emploiTarget?.user?.fullName || emploiTarget?.user?.email} à un
              superviseur pour le suivi post-recrutement.
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
              disabled={!emploiSupervisorId || !emploiStartDate || emploiMutation.isPending}
            >
              {emploiMutation.isPending ? "Création…" : "Créer le dossier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
