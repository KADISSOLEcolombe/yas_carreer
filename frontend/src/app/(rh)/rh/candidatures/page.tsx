"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowUpDown, CheckCircle2, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { ApiError, applicationsApi, offersApi } from "@/lib/api";
import { APPLICATION_STATUS_ORDER } from "@/lib/constants";
import type { ApplicationStatus } from "@/lib/types";
import {
  SoftPageHeader,
  SoftSearch,
  SoftTabs,
  SoftToolbar,
} from "@/components/shared/soft-ui";
import { ApplicationsTable } from "@/components/shared/applications-table";
import { AiRankingDialog } from "@/components/shared/ai-ranking-dialog";

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
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [rankOpen, setRankOpen] = useState(false);

  const { data: applications, isLoading } = useQuery({
    queryKey: ["applications", "rh", offerId ?? "all"],
    queryFn: () => applicationsApi.list(offerId ? { offerId } : undefined),
  });

  const { data: offer } = useQuery({
    queryKey: ["offer", offerId],
    queryFn: () => offersApi.get(offerId!),
    enabled: Boolean(offerId),
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
            variant="outline"
            className="h-7 gap-1.5 rounded-lg border-yas-sky/40 px-2.5 text-yas-midnight"
            onClick={() => setRankOpen(true)}
          >
            <Trophy className="size-3.5 text-yas-sky" />
            Analyser les candidatures par IA
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

      <ApplicationsTable
        applications={filtered}
        isLoading={isLoading}
        onSelectionChange={setSelected}
      />

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

      {offerId && (
        <AiRankingDialog
          open={rankOpen}
          onOpenChange={setRankOpen}
          initialOfferId={offerId}
        />
      )}
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
