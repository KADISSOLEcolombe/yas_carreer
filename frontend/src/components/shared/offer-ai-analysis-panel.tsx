"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ApiError, applicationsApi, fileUrl, offersApi } from "@/lib/api";
import { APPLICATION_STATUS_LABELS } from "@/lib/constants";
import type {
  AiRankGrade,
  AiRecommendation,
  Application,
  Offer,
} from "@/lib/types";
import {
  SoftCard,
  SoftStatusPill,
  scoreTone,
  statusTone,
} from "@/components/shared/soft-ui";
import { cn } from "@/lib/utils";
import { trackRhAction } from "@/lib/track-activity";

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

const CRITERIA_PLACEHOLDER = `Exemples de consignes RH :
• Prioriser l’anglais courant et l’expérience télécoms
• Mobilité Lomé obligatoire
• Minimum 2 ans d’expérience terrain
• Soft skills : leadership, autonomie
• Écarter les profils sans diplôme Bac+2`;

function scoreToGrade(score: number): AiRankGrade {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "E";
}

function initials(name?: string | null, email?: string) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
  }
  return (email?.slice(0, 2) || "?").toUpperCase();
}

function matchesCurrentCriteria(app: Application, criteria: string) {
  return (app.aiAnalysisData?.criteriaUsed || "").trim() === criteria.trim();
}

function isAnalyzed(app: Application, criteria: string) {
  return (
    app.aiMatchScore != null &&
    app.aiAnalyzedAt != null &&
    matchesCurrentCriteria(app, criteria)
  );
}

type Props = {
  offer: Offer;
  applications: Application[];
  loading?: boolean;
};

export function OfferAiAnalysisPanel({
  offer,
  applications,
  loading,
}: Props) {
  const offerId = offer.id;
  const queryClient = useQueryClient();
  const cancelRef = useRef(false);
  const [criteria, setCriteria] = useState(offer.aiAnalysisCriteria || "");
  const [savingCriteria, setSavingCriteria] = useState(false);
  const [running, setRunning] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [doneCount, setDoneCount] = useState(0);
  const [totalTarget, setTotalTarget] = useState(0);
  const [statusLabel, setStatusLabel] = useState("");
  const [showCompare, setShowCompare] = useState(false);
  const autoShownRef = useRef(false);

  useEffect(() => {
    setCriteria(offer.aiAnalysisCriteria || "");
  }, [offer.aiAnalysisCriteria, offer.id]);

  useEffect(() => {
    if (
      !autoShownRef.current &&
      applications.some((a) => isAnalyzed(a, criteria))
    ) {
      autoShownRef.current = true;
      setShowCompare(true);
    }
  }, [applications, criteria]);

  const pending = useMemo(
    () => applications.filter((a) => !isAnalyzed(a, criteria)),
    [applications, criteria]
  );
  const analyzed = useMemo(() => {
    return [...applications]
      .filter((a) => isAnalyzed(a, criteria))
      .sort(
        (a, b) =>
          (b.aiMatchScore ?? 0) - (a.aiMatchScore ?? 0) || a.id - b.id
      );
  }, [applications, criteria]);

  const staleCount = useMemo(
    () =>
      applications.filter(
        (a) =>
          a.aiMatchScore != null &&
          a.aiAnalyzedAt != null &&
          !matchesCurrentCriteria(a, criteria)
      ).length,
    [applications, criteria]
  );

  const criteriaDirty =
    criteria.trim() !== (offer.aiAnalysisCriteria || "").trim();

  const progressPct =
    totalTarget > 0 ? Math.round((doneCount / totalTarget) * 100) : 0;

  async function saveCriteria() {
    setSavingCriteria(true);
    try {
      await offersApi.updateAiCriteria(offerId, criteria.trim() || null);
      await queryClient.invalidateQueries({ queryKey: ["offer", String(offerId)] });
      toast.success("Critères d’analyse enregistrés");
      trackRhAction(
        "ui.offer_ai_criteria",
        `Critères IA mis à jour pour « ${offer.title} »`,
        {
          category: "ui",
          resourceType: "offer",
          resourceId: offerId,
          metadata: { criteriaLength: criteria.trim().length },
        }
      );
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Impossible d’enregistrer les critères"
      );
    } finally {
      setSavingCriteria(false);
    }
  }

  async function runBatch(forceAll: boolean) {
    const queue = forceAll ? [...applications] : pending;
    if (queue.length === 0) {
      toast.message(
        forceAll
          ? "Aucune candidature à analyser"
          : "Toutes les candidatures sont déjà analysées avec ces critères"
      );
      setShowCompare(true);
      return;
    }

    cancelRef.current = false;
    setRunning(true);
    setDoneCount(0);
    setTotalTarget(queue.length);
    setShowCompare(false);

    try {
      await offersApi.updateAiCriteria(offerId, criteria.trim() || null);
      await queryClient.invalidateQueries({ queryKey: ["offer", String(offerId)] });
    } catch {
      // continue — criteria also sent on each analyze call
    }

    trackRhAction(
      "ui.offer_ai_batch",
      `Analyse IA de ${queue.length} candidature(s) sur l’offre #${offerId}`,
      {
        category: "ui",
        resourceType: "offer",
        resourceId: offerId,
        metadata: {
          count: queue.length,
          force: forceAll,
          hasCriteria: Boolean(criteria.trim()),
        },
      }
    );

    let ok = 0;
    let failed = 0;
    const criteriaPayload = criteria.trim();

    for (let i = 0; i < queue.length; i++) {
      if (cancelRef.current) break;
      const app = queue[i];
      const name = app.user?.fullName || app.user?.email || `Candidature #${app.id}`;
      setCurrentId(app.id);
      setStatusLabel(`Analyse de ${name}…`);
      try {
        await applicationsApi.aiAnalyze(app.id, {
          force: forceAll || !matchesCurrentCriteria(app, criteriaPayload),
          criteria: criteriaPayload,
        });
        ok++;
      } catch (error) {
        failed++;
        toast.error(
          error instanceof ApiError
            ? `${name} : ${error.message}`
            : `Échec pour ${name}`
        );
      }
      setDoneCount(i + 1);
      await queryClient.invalidateQueries({
        queryKey: ["applications", "offer", String(offerId)],
      });
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
    }

    setCurrentId(null);
    setRunning(false);
    setStatusLabel("");
    setShowCompare(true);

    if (cancelRef.current) {
      toast.message("Analyse interrompue");
    } else if (ok > 0) {
      toast.success(
        `${ok} analyse${ok > 1 ? "s" : ""} enregistrée${ok > 1 ? "s" : ""}${
          failed ? ` · ${failed} échec${failed > 1 ? "s" : ""}` : ""
        }`
      );
    }
  }

  return (
    <SoftCard>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-heading text-lg font-semibold text-yas-midnight">
            Dernières candidatures
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {applications.length} au total
            {analyzed.length > 0 &&
              ` · ${analyzed.length} analysée${analyzed.length > 1 ? "s" : ""}`}
            {pending.length > 0 &&
              ` · ${pending.length} en attente`}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2 rounded-2xl border border-yas-sky/20 bg-yas-sky/5 p-3">
        <Label
          htmlFor="ai-criteria"
          className="text-xs font-semibold uppercase tracking-wide text-yas-midnight"
        >
          Critères RH pour l’analyse IA
        </Label>
        <p className="text-[11px] leading-relaxed text-slate-500">
          Ces consignes s’appliquent à <strong>tous</strong> les candidats de
          cette offre. L’IA les priorise dans le scoring et la comparaison.
        </p>
        <Textarea
          id="ai-criteria"
          value={criteria}
          onChange={(e) => setCriteria(e.target.value)}
          disabled={running}
          rows={5}
          placeholder={CRITERIA_PLACEHOLDER}
          className="resize-y rounded-xl border-slate-200 bg-white text-sm"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={running || savingCriteria || !criteriaDirty}
            onClick={() => void saveCriteria()}
            className="h-8 rounded-lg text-xs"
          >
            {savingCriteria ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : null}
            Enregistrer les critères
          </Button>
          {staleCount > 0 && (
            <span className="text-[11px] font-medium text-amber-700">
              {staleCount} analyse{staleCount > 1 ? "s" : ""} à actualiser
              (critères modifiés)
            </span>
          )}
        </div>
      </div>

      {applications.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={running || applications.length === 0}
              onClick={() => {
                if (pending.length === 0) {
                  setShowCompare(true);
                  return;
                }
                void runBatch(false);
              }}
              className="h-10 flex-1 gap-2 rounded-xl bg-yas-midnight text-white hover:bg-yas-midnight/90 sm:flex-none"
            >
              {running ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {pending.length > 0
                ? `Analyser (${pending.length})`
                : "Comparer"}
            </Button>
            {analyzed.length > 0 && (
              <Button
                type="button"
                variant="outline"
                disabled={running}
                onClick={() => setShowCompare((v) => !v)}
                className="h-10 gap-2 rounded-xl"
              >
                <Trophy className="size-4 text-yas-sky" />
                {showCompare ? "Masquer" : "Comparaison"}
              </Button>
            )}
            {(analyzed.length > 0 || staleCount > 0) && (
              <Button
                type="button"
                variant="ghost"
                disabled={running}
                onClick={() => void runBatch(true)}
                className="h-10 gap-1.5 rounded-xl text-slate-500"
                title="Relancer toutes les analyses avec les critères actuels"
              >
                <RefreshCw className="size-3.5" />
                Relancer
              </Button>
            )}
          </div>

          {running && (
            <div className="overflow-hidden rounded-2xl border border-yas-sky/30 bg-gradient-to-br from-yas-sky/10 to-yas-yellow/15 p-4">
              <div className="flex items-center justify-between gap-2 text-xs font-medium text-yas-midnight">
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 className="size-3.5 animate-spin text-yas-sky" />
                  {statusLabel || "Analyse en cours…"}
                </span>
                <span className="tabular-nums text-slate-500">
                  {doneCount}/{totalTarget}
                </span>
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/80">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-yas-sky to-yas-yellow transition-[width] duration-500 ease-out"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                Même grille de critères pour chaque dossier — résultats
                enregistrés en base.
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2 h-8 rounded-lg text-xs text-slate-500"
                onClick={() => {
                  cancelRef.current = true;
                }}
              >
                Interrompre
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 space-y-3">
        {loading && (
          <p className="py-6 text-center text-sm text-slate-400">
            Chargement…
          </p>
        )}
        {!loading && applications.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
            Personne n&apos;a encore candidaté.
          </div>
        )}

        {!loading &&
          [...applications]
            .sort(
              (a, b) =>
                new Date(b.appliedAt).getTime() -
                new Date(a.appliedAt).getTime()
            )
            .slice(0, showCompare ? applications.length : 6)
            .map((app) => {
              const name = app.user?.fullName || app.user?.email || "Candidat";
              const analyzing = running && currentId === app.id;
              const done = isAnalyzed(app, criteria);
              const stale =
                app.aiMatchScore != null &&
                !matchesCurrentCriteria(app, criteria);
              return (
                <div
                  key={app.id}
                  className={cn(
                    "rounded-xl p-3 transition",
                    analyzing
                      ? "bg-yas-sky/10 ring-2 ring-yas-sky/30"
                      : "bg-slate-50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="size-10">
                      <AvatarFallback className="bg-yas-sky/15 text-xs font-semibold text-yas-midnight">
                        {initials(app.user?.fullName, app.user?.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-slate-800">
                          {name}
                        </p>
                        {analyzing && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-yas-sky">
                            <Loader2 className="size-3 animate-spin" />
                            Matching…
                          </span>
                        )}
                        {done && !analyzing && (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 text-xs font-semibold tabular-nums",
                              scoreTone(app.aiMatchScore!)
                            )}
                          >
                            <Sparkles className="size-3" />
                            {app.aiMatchScore}/100
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-slate-400">
                        {app.user?.email}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <SoftStatusPill tone={statusTone(app.status)}>
                          {APPLICATION_STATUS_LABELS[app.status]}
                        </SoftStatusPill>
                        {done ? (
                          <span className="text-[11px] font-medium text-emerald-600">
                            Analysé
                          </span>
                        ) : stale ? (
                          <span className="text-[11px] font-medium text-amber-600">
                            Critères changés
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            Non analysé
                          </span>
                        )}
                      </div>
                      {analyzing && (
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                          <div className="h-full w-2/3 animate-pulse rounded-full bg-yas-sky" />
                        </div>
                      )}
                      <p className="mt-1 text-[11px] text-slate-400">
                        {new Date(app.appliedAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        {app.cvUrl && (
                          <>
                            {" · "}
                            <a
                              href={fileUrl(app.cvUrl)!}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium text-yas-sky hover:underline"
                            >
                              CV
                            </a>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>

      {showCompare && analyzed.length > 0 && (
        <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2">
            <Trophy className="size-4 text-yas-yellow" />
            <h3 className="font-heading text-base font-semibold text-yas-midnight">
              Comparaison IA
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Classement selon vos critères RH
            {criteria.trim() ? " actuels" : " (offre seule)"}.
          </p>
          {criteria.trim() && (
            <div className="rounded-xl bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-600">
              <span className="font-semibold text-yas-midnight">Grille : </span>
              {criteria.trim().slice(0, 280)}
              {criteria.trim().length > 280 ? "…" : ""}
            </div>
          )}
          <ol className="space-y-2.5">
            {analyzed.map((app, index) => {
              const name = app.user?.fullName || app.user?.email || "Candidat";
              const grade =
                (app.aiAnalysisData?.grade as AiRankGrade) ||
                scoreToGrade(app.aiMatchScore!);
              const rec = app.aiAnalysisData?.recommendation;
              const strengths = app.aiAnalysisData?.strengths || [];
              const gaps = app.aiAnalysisData?.gaps || [];
              return (
                <li
                  key={app.id}
                  className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={cn(
                        "flex size-10 shrink-0 flex-col items-center justify-center rounded-xl text-xs font-bold",
                        GRADE_STYLE[grade] || GRADE_STYLE.E
                      )}
                    >
                      <span className="text-[8px] font-medium uppercase opacity-80">
                        #{index + 1}
                      </span>
                      {grade}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {name}
                        </p>
                        <span
                          className={cn(
                            "ml-auto text-sm font-bold tabular-nums",
                            scoreTone(app.aiMatchScore!)
                          )}
                        >
                          {app.aiMatchScore}/100
                        </span>
                      </div>
                      {rec && (
                        <span
                          className={cn(
                            "mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            REC_STYLE[rec]
                          )}
                        >
                          {REC_LABEL[rec]}
                        </span>
                      )}
                      {app.aiSummary && (
                        <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-slate-600">
                          {app.aiSummary}
                        </p>
                      )}
                      {(strengths.length > 0 || gaps.length > 0) && (
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          {strengths.length > 0 && (
                            <ul className="space-y-1">
                              {strengths.slice(0, 3).map((s) => (
                                <li
                                  key={s}
                                  className="flex gap-1 text-[11px] text-slate-600"
                                >
                                  <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-emerald-500" />
                                  {s}
                                </li>
                              ))}
                            </ul>
                          )}
                          {gaps.length > 0 && (
                            <ul className="space-y-1">
                              {gaps.slice(0, 3).map((s) => (
                                <li
                                  key={s}
                                  className="flex gap-1 text-[11px] text-slate-600"
                                >
                                  <XCircle className="mt-0.5 size-3 shrink-0 text-amber-500" />
                                  {s}
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

      <Button
        asChild
        className="mt-4 h-11 w-full gap-2 rounded-xl bg-yas-midnight text-white hover:bg-yas-midnight/90"
      >
        <Link href={`/rh/candidatures?offerId=${offerId}`}>
          Voir tous les candidats
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </SoftCard>
  );
}
