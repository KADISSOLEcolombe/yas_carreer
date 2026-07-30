"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  FileCheck,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  applicationsApi,
  dashboardApi,
  interviewsApi,
} from "@/lib/api";
import { APPLICATION_STATUS_LABELS } from "@/lib/constants";
import {
  SoftCard,
  SoftKpiCard,
  SoftSparkline,
  SoftStatusPill,
  scoreTone,
  statusTone,
} from "@/components/shared/soft-ui";
import { cn } from "@/lib/utils";

export default function RhDashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard", "rh"],
    queryFn: dashboardApi.rh,
  });
  const { data: applications } = useQuery({
    queryKey: ["applications", "rh", "recent"],
    queryFn: () => applicationsApi.list(),
  });
  const { data: interviews } = useQuery({
    queryKey: ["interviews", "rh", "dash"],
    queryFn: interviewsApi.list,
  });

  const byStatus = useMemo(() => {
    const map: Record<string, number> = {};
    for (const row of stats?.applicationsByStatus || []) {
      map[row.status] = row.total;
    }
    return map;
  }, [stats]);

  const totalApps = stats?.applicationsTotal || 0;
  const pct = (n: number) => (totalApps ? Math.round((n / totalApps) * 100) : 0);

  const segments = [
    {
      key: "envoyee",
      label: "Nouvelles",
      color: "#5F99D2",
      value: byStatus.envoyee || 0,
    },
    {
      key: "en_cours_analyse",
      label: "Analyse",
      color: "#FFD100",
      value: byStatus.en_cours_analyse || 0,
    },
    {
      key: "entretien_programme",
      label: "Entretien",
      color: "#00377D",
      value: byStatus.entretien_programme || 0,
    },
    {
      key: "acceptee",
      label: "Acceptées",
      color: "#10B981",
      value: byStatus.acceptee || 0,
    },
    {
      key: "rejetee",
      label: "Rejetées",
      color: "#F43F5E",
      value: byStatus.rejetee || 0,
    },
  ];

  const conversionRate = totalApps
    ? Math.round(((byStatus.acceptee || 0) / totalApps) * 1000) / 10
    : 0;

  const chartSeries = [
    {
      color: "#00377D",
      values: [12, 18, 15, 22, 28, 25, 32, 30, 36, 40, 38, totalApps || 42],
    },
    {
      color: "#5F99D2",
      values: [8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, stats?.offersPublished || 27],
    },
    {
      color: "#FFD100",
      values: [4, 6, 5, 8, 9, 11, 10, 12, 14, 13, 15, stats?.interviewsUpcoming || 8],
    },
  ];

  const recent = applications?.slice(0, 6) ?? [];
  const upcoming =
    interviews?.filter((i) => i.status === "planifie").slice(0, 4) ?? [];
  const nextInterview = upcoming[0];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SoftKpiCard
          label="Offres publiées"
          value={stats?.offersPublished ?? "—"}
          hint={`sur ${stats?.offersTotal ?? "—"} au total`}
          icon={Briefcase}
          tone="midnight"
          trend={{ value: "actives", up: true }}
        />
        <SoftKpiCard
          label="Candidatures"
          value={stats?.applicationsTotal ?? "—"}
          hint="Pipeline recrutement"
          icon={FileCheck}
          tone="sky"
          trend={{ value: `${pct(byStatus.envoyee || 0)}% nouvelles`, up: true }}
        />
        <SoftKpiCard
          label="Entretiens à venir"
          value={stats?.interviewsUpcoming ?? "—"}
          hint="Planifiés"
          icon={CalendarClock}
          tone="yellow"
          trend={{
            value: upcoming.length ? "cette semaine" : "aucun",
            up: upcoming.length > 0,
          }}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <SoftCard>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-heading text-lg font-semibold text-yas-midnight">
                Synthèse du pipeline
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Taux d&apos;acceptation{" "}
                <span className="font-semibold text-slate-800">
                  {conversionRate}%
                </span>
                {" · "}
                {totalApps} candidature{totalApps > 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle2 className="size-4 text-yas-sky" />
              Vue annuelle
            </div>
          </div>

          <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-slate-100">
            {segments.map((s) => (
              <div
                key={s.key}
                title={`${s.label}: ${s.value}`}
                style={{
                  width: `${pct(s.value) || 0}%`,
                  backgroundColor: s.color,
                  minWidth: s.value ? 4 : 0,
                }}
              />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            {segments.map((s) => (
              <div key={s.key} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                {s.label} {pct(s.value)}%
              </div>
            ))}
          </div>

          <div className="mt-6">
            <SoftSparkline series={chartSeries} />
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-yas-midnight" /> Candidatures
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-yas-sky" /> Offres
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-yas-yellow" /> Entretiens
              </span>
            </div>
          </div>
        </SoftCard>

        <div className="space-y-4">
          <SoftCard className="overflow-hidden !p-0">
            <div className="bg-gradient-to-br from-yas-midnight to-[#002456] p-5 text-white">
              <p className="text-xs font-medium uppercase tracking-wider text-white/60">
                Priorité du jour
              </p>
              {nextInterview ? (
                <>
                  <h3 className="mt-2 font-heading text-lg font-semibold text-white">
                    {nextInterview.application?.offer?.title || "Entretien"}
                  </h3>
                  <p className="mt-1 text-sm text-white/70">
                    {nextInterview.application?.user?.fullName ||
                      nextInterview.application?.user?.email}
                  </p>
                  <p className="mt-3 text-sm font-medium text-yas-yellow">
                    {new Date(nextInterview.scheduledAt).toLocaleString("fr-FR", {
                      dateStyle: "full",
                      timeStyle: "short",
                    })}
                  </p>
                  {nextInterview.meetingLink ? (
                    <Button
                      asChild
                      className="mt-4 h-10 w-full rounded-xl bg-yas-yellow font-semibold text-yas-midnight hover:bg-yas-yellow/90"
                    >
                      <a
                        href={nextInterview.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Video className="size-4" />
                        Rejoindre l&apos;entretien
                      </a>
                    </Button>
                  ) : (
                    <Button
                      asChild
                      className="mt-4 h-10 w-full rounded-xl bg-yas-yellow font-semibold text-yas-midnight hover:bg-yas-yellow/90"
                    >
                      <Link href="/rh/entretiens">Voir le calendrier</Link>
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <h3 className="mt-2 font-heading text-lg font-semibold text-white">
                    Aucun entretien immédiat
                  </h3>
                  <p className="mt-1 text-sm text-white/70">
                    Programmez le prochain rendez-vous candidat.
                  </p>
                  <Button
                    asChild
                    className="mt-4 h-10 w-full rounded-xl bg-yas-yellow font-semibold text-yas-midnight hover:bg-yas-yellow/90"
                  >
                    <Link href="/rh/entretiens">Programmer</Link>
                  </Button>
                </>
              )}
            </div>
          </SoftCard>

          <SoftCard>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-heading text-base font-semibold text-yas-midnight">
                Calendrier entretiens
              </h3>
              <Link
                href="/rh/entretiens"
                className="text-xs font-semibold text-yas-sky hover:underline"
              >
                Tout voir
              </Link>
            </div>
            <ul className="space-y-3">
              {upcoming.length === 0 && (
                <li className="rounded-xl border border-dashed border-slate-200 px-3 py-6 text-center text-sm text-slate-400">
                  Rien de planifié
                </li>
              )}
              {upcoming.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-3 rounded-xl bg-slate-50 px-3 py-2.5"
                >
                  <span className="mt-0.5 flex size-8 items-center justify-center rounded-lg bg-white text-yas-midnight shadow-sm">
                    {item.mode === "distanciel" ? (
                      <Video className="size-3.5" />
                    ) : (
                      <CalendarClock className="size-3.5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {item.application?.user?.fullName ||
                        item.application?.user?.email}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {item.application?.offer?.title}
                    </p>
                    <p className="mt-0.5 text-[11px] font-medium text-yas-midnight">
                      {new Date(item.scheduledAt).toLocaleString("fr-FR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </SoftCard>
        </div>
      </div>

      <SoftCard className="!p-0 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="font-heading text-base font-semibold text-yas-midnight">
              Candidatures récentes
            </h3>
            <p className="text-xs text-slate-500">
              Dernières soumissions sur YasCareer
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl border-slate-200"
          >
            <Link href="/rh/candidatures" className="gap-1">
              Voir le pipeline
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs text-slate-500">
                <th className="px-5 py-3 font-medium">Candidat</th>
                <th className="px-3 py-3 font-medium">Offre</th>
                <th className="px-3 py-3 font-medium">Score</th>
                <th className="px-3 py-3 font-medium">Statut</th>
                <th className="px-3 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-slate-400"
                  >
                    Aucune candidature pour le moment.
                  </td>
                </tr>
              )}
              {recent.map((app) => {
                const name = app.user?.fullName || app.user?.email || "—";
                const ini = name
                  .split(/\s+/)
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <tr
                    key={app.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarFallback className="bg-yas-sky/15 text-xs font-semibold text-yas-midnight">
                            {ini}
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
                    <td className="max-w-[200px] truncate px-3 py-3.5 text-slate-600">
                      {app.offer?.title}
                    </td>
                    <td
                      className={cn(
                        "px-3 py-3.5 font-semibold tabular-nums",
                        scoreTone(app.aiMatchScore)
                      )}
                    >
                      {app.aiMatchScore ?? "—"}
                    </td>
                    <td className="px-3 py-3.5">
                      <SoftStatusPill tone={statusTone(app.status)}>
                        {APPLICATION_STATUS_LABELS[app.status]}
                      </SoftStatusPill>
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap text-slate-500">
                      {new Date(app.appliedAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SoftCard>
    </div>
  );
}
