"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  Globe,
  ImageIcon,
  Loader2,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ApiError, applicationsApi, fileUrl, offersApi } from "@/lib/api";
import type {
  AiRankGrade,
  AiRecommendation,
  OfferAiRanking,
} from "@/lib/types";
import { scoreTone } from "@/components/shared/soft-ui";
import { cn } from "@/lib/utils";

const GRADE_STYLE: Record<AiRankGrade, string> = {
  A: "bg-emerald-500 text-white",
  B: "bg-yas-sky text-white",
  C: "bg-amber-400 text-yas-midnight",
  D: "bg-orange-400 text-white",
  E: "bg-slate-400 text-white",
};

const REC_LABEL: Record<AiRecommendation, string> = {
  retenir: "À retenir",
  a_envisager: "À envisager",
  ecarter: "À écarter",
};

const REC_STYLE: Record<AiRecommendation, string> = {
  retenir: "bg-emerald-100 text-emerald-800",
  a_envisager: "bg-amber-100 text-amber-800",
  ecarter: "bg-rose-100 text-rose-700",
};

function initials(name?: string | null, email?: string) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
  }
  return (email?.slice(0, 2) || "?").toUpperCase();
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialOfferId?: number;
};

export function AiRankingDialog({ open, onOpenChange, initialOfferId }: Props) {
  const queryClient = useQueryClient();
  const [offerId, setOfferId] = useState<string>(
    initialOfferId ? String(initialOfferId) : ""
  );
  const [result, setResult] = useState<OfferAiRanking | null>(null);
  const [webSearch, setWebSearch] = useState(true);
  const [criteria, setCriteria] = useState("");

  const { data: offers } = useQuery({
    queryKey: ["offers", "rh-all"],
    queryFn: () => offersApi.list(),
    enabled: open,
  });

  const published = useMemo(() => offers ?? [], [offers]);

  useEffect(() => {
    if (open && initialOfferId) setOfferId(String(initialOfferId));
  }, [open, initialOfferId]);

  useEffect(() => {
    if (!offerId || !published.length) return;
    const selected = published.find((o) => String(o.id) === offerId);
    if (selected) setCriteria(selected.aiAnalysisCriteria || "");
  }, [offerId, published]);

  const rankMutation = useMutation({
    mutationFn: ({ id, force }: { id: number; force?: boolean }) =>
      applicationsApi.aiRankOffer(id, {
        webSearch,
        force,
        criteria: criteria.trim(),
      }),
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      if (data.fromCache) {
        toast.success(
          data.ranked.length
            ? `Comparaison prête (${data.ranked.length} analyses en cache)`
            : "Aucune candidature à classer"
        );
      } else {
        toast.success(
          data.ranked.length
            ? `${data.analyzedNow ?? data.ranked.length} nouvelle${(data.analyzedNow ?? 0) > 1 ? "s" : ""} analyse${(data.analyzedNow ?? 0) > 1 ? "s" : ""} · ${data.ranked.length} classée${data.ranked.length > 1 ? "s" : ""}`
            : "Aucune candidature à classer"
        );
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "Classement impossible"
      );
    },
  });

  function handleClose(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setResult(null);
      rankMutation.reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-slate-100 px-6 py-5 text-left">
          <DialogTitle className="flex items-center gap-2 font-heading text-xl text-yas-midnight">
            <Trophy className="size-5 text-yas-yellow" />
            Classement IA des candidatures
          </DialogTitle>
          <DialogDescription>
            L&apos;IA lit les CV, lettres, profils et peut chercher des infos
            publiques sur le web, puis classe les candidats (notes A → E).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto px-6 py-5">
          <div className="rounded-2xl bg-gradient-to-br from-yas-midnight to-[#0a4a9e] p-4 text-white">
            <p className="text-sm text-white/75">
              Choisissez une offre, puis lancez l&apos;analyse complète du
              vivier.
            </p>
            <label className="mt-3 flex cursor-pointer items-start gap-2.5 rounded-xl bg-white/10 px-3 py-2.5 text-sm">
              <Checkbox
                checked={webSearch}
                onCheckedChange={(c) => setWebSearch(c === true)}
                className="mt-0.5 border-white/40 data-checked:border-yas-yellow data-checked:bg-yas-yellow data-checked:text-yas-midnight"
              />
              <span>
                <span className="flex items-center gap-1.5 font-semibold text-white">
                  <Globe className="size-3.5 text-yas-yellow" />
                  Recherche web sur chaque candidat
                </span>
                <span className="mt-0.5 block text-xs text-white/65">
                  LinkedIn, mentions publiques, profils… (infos publiques
                  uniquement)
                </span>
              </span>
            </label>
            <div className="mt-3 space-y-1.5">
              <p className="text-xs font-semibold text-yas-yellow">
                Critères RH (appliqués à tous)
              </p>
              <Textarea
                value={criteria}
                onChange={(e) => setCriteria(e.target.value)}
                rows={3}
                placeholder="Ex. anglais obligatoire, 2 ans télécoms, mobilité Lomé…"
                className="rounded-xl border-0 bg-white/10 text-sm text-white placeholder:text-white/45"
              />
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Select
                value={offerId}
                onValueChange={(v) => {
                  setOfferId(v);
                  setResult(null);
                }}
                disabled={Boolean(initialOfferId)}
              >
                <SelectTrigger className="h-11 flex-1 rounded-xl border-0 bg-white/10 text-white">
                  <SelectValue placeholder="Sélectionner une offre" />
                </SelectTrigger>
                <SelectContent>
                  {published.map((o) => (
                    <SelectItem key={o.id} value={String(o.id)}>
                      {o.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                disabled={!offerId || rankMutation.isPending}
                onClick={() =>
                  rankMutation.mutate({
                    id: Number(offerId),
                    force: false,
                  })
                }
                className="h-11 gap-2 rounded-xl bg-yas-yellow font-semibold text-yas-midnight hover:bg-yas-yellow/90"
              >
                {rankMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Analyse en cours…
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    Classer (cache)
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!offerId || rankMutation.isPending}
                onClick={() =>
                  rankMutation.mutate({
                    id: Number(offerId),
                    force: true,
                  })
                }
                className="h-11 gap-2 rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20"
              >
                Relancer
              </Button>
            </div>
            <p className="mt-2 text-[11px] text-white/55">
              Les scores déjà enregistrés sont réutilisés. « Relancer » force une
              nouvelle analyse de tous les dossiers.
            </p>
          </div>

          {rankMutation.isPending && (
            <div className="rounded-2xl border border-dashed border-yas-sky/40 bg-yas-sky/5 px-4 py-10 text-center">
              <Loader2 className="mx-auto size-7 animate-spin text-yas-sky" />
              <p className="mt-3 font-heading text-sm font-semibold text-yas-midnight">
                {webSearch
                  ? "Lecture dossiers + recherche web…"
                  : "Lecture des dossiers et scoring…"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {webSearch
                  ? "CV, lettres, profils et infos publiques — cela peut prendre un moment."
                  : "Extraction CV, lettres, compétences — quelques secondes."}
              </p>
            </div>
          )}

          {result && !rankMutation.isPending && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Synthèse RH
                </p>
                <p className="mt-2 text-sm leading-relaxed text-emerald-950">
                  {result.overview}
                </p>
                <p className="mt-3 text-xs font-medium text-emerald-800">
                  {result.recommendedCount} profil
                  {result.recommendedCount > 1 ? "s" : ""} prioritaire
                  {result.recommendedCount > 1 ? "s" : ""}
                  {" · "}
                  {result.ranked.length} analysé
                  {result.ranked.length > 1 ? "s" : ""}
                </p>
              </div>

              {result.ranked.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-400">
                  Aucune candidature sur cette offre.
                </p>
              )}

              <ol className="space-y-3">
                {result.ranked.map((item) => {
                  const app = item.application;
                  const name =
                    app.user?.fullName || app.user?.email || "Candidat";
                  return (
                    <li
                      key={item.applicationId}
                      className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "flex size-11 shrink-0 flex-col items-center justify-center rounded-xl text-sm font-bold",
                            GRADE_STYLE[item.grade]
                          )}
                        >
                          <span className="text-[9px] font-medium uppercase opacity-80">
                            #{item.rank}
                          </span>
                          {item.grade}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Avatar className="size-8">
                              <AvatarFallback className="bg-yas-sky/15 text-[10px] font-semibold text-yas-midnight">
                                {initials(app.user?.fullName, app.user?.email)}
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
                            <span
                              className={cn(
                                "ml-auto text-sm font-bold tabular-nums",
                                scoreTone(item.score)
                              )}
                            >
                              {item.score}/100
                            </span>
                          </div>

                          <span
                            className={cn(
                              "mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
                              REC_STYLE[item.recommendation]
                            )}
                          >
                            {REC_LABEL[item.recommendation]}
                          </span>

                          <p className="mt-2 text-sm leading-relaxed text-slate-600">
                            {item.summary}
                          </p>

                          {(item.strengths.length > 0 ||
                            item.gaps.length > 0) && (
                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                              {item.strengths.length > 0 && (
                                <div>
                                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
                                    Points forts
                                  </p>
                                  <ul className="space-y-1">
                                    {item.strengths.map((s) => (
                                      <li
                                        key={s}
                                        className="flex gap-1.5 text-xs text-slate-600"
                                      >
                                        <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-emerald-500" />
                                        {s}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {item.gaps.length > 0 && (
                                <div>
                                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-amber-600">
                                    Points d&apos;attention
                                  </p>
                                  <ul className="space-y-1">
                                    {item.gaps.map((s) => (
                                      <li
                                        key={s}
                                        className="flex gap-1.5 text-xs text-slate-600"
                                      >
                                        <XCircle className="mt-0.5 size-3 shrink-0 text-amber-500" />
                                        {s}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="mt-3 flex flex-wrap gap-2">
                            {item.documents.map((doc) => (
                              <span
                                key={doc.label}
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium",
                                  doc.ok
                                    ? "bg-slate-100 text-slate-600"
                                    : "bg-slate-50 text-slate-400"
                                )}
                              >
                                {doc.images > 0 ? (
                                  <ImageIcon className="size-3" />
                                ) : (
                                  <FileText className="size-3" />
                                )}
                                {doc.label}
                                {doc.ok
                                  ? doc.images > 0
                                    ? ` · ${doc.images} img`
                                    : ""
                                  : " · —"}
                              </span>
                            ))}
                            {app.cvUrl && (
                              <a
                                href={fileUrl(app.cvUrl)!}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded-full bg-yas-sky/10 px-2.5 py-1 text-[11px] font-semibold text-yas-midnight hover:bg-yas-sky/20"
                              >
                                Ouvrir le CV
                              </a>
                            )}
                          </div>

                          {item.webResearch && (
                            <div className="mt-3 rounded-xl border border-sky-100 bg-sky-50/70 p-3">
                              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-yas-sky">
                                <Globe className="size-3.5" />
                                Recherche web
                                {item.webResearch.provider !== "none" && (
                                  <span className="font-normal normal-case text-slate-400">
                                    · {item.webResearch.provider}
                                  </span>
                                )}
                              </p>
                              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                                {item.webResearch.summary}
                              </p>
                              {item.webResearch.sources.length > 0 && (
                                <ul className="mt-2 space-y-1">
                                  {item.webResearch.sources
                                    .slice(0, 3)
                                    .map((src) => (
                                      <li key={src.url}>
                                        <a
                                          href={src.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-flex max-w-full items-center gap-1 truncate text-[11px] font-medium text-yas-midnight hover:underline"
                                        >
                                          <ExternalLink className="size-3 shrink-0" />
                                          <span className="truncate">
                                            {src.title || src.url}
                                          </span>
                                        </a>
                                      </li>
                                    ))}
                                </ul>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
