"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Briefcase,
  CalendarClock,
  FileCheck,
  UserCog,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { dashboardApi, usersApi } from "@/lib/api";
import {
  APPLICATION_STATUS_LABELS,
  ROLE_LABELS,
} from "@/lib/constants";
import {
  SoftCard,
  SoftKpiCard,
  SoftSparkline,
  SoftStatusPill,
  statusTone,
} from "@/components/shared/soft-ui";

export default function AdminDashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard", "admin"],
    queryFn: dashboardApi.admin,
  });
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => usersApi.list(),
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

  const recentUsers = users?.slice(0, 6) ?? [];

  const chartSeries = [
    {
      color: "#00377D",
      values: [20, 24, 28, 30, 34, 36, 40, 42, 45, 48, 50, stats?.usersTotal || 52],
    },
    {
      color: "#5F99D2",
      values: [5, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, stats?.offersTotal || 29],
    },
    {
      color: "#FFD100",
      values: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, totalApps || 14],
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SoftKpiCard
          label="Utilisateurs"
          value={stats?.usersTotal ?? "—"}
          hint="Comptes plateforme"
          icon={Users}
          tone="midnight"
          trend={{ value: "actifs", up: true }}
        />
        <SoftKpiCard
          label="Comptes RH"
          value={stats?.rhCount ?? "—"}
          hint="Accès recrutement"
          icon={UserCog}
          tone="sky"
          trend={{ value: "équipe", up: true }}
        />
        <SoftKpiCard
          label="Offres"
          value={stats?.offersTotal ?? "—"}
          hint="Tous statuts"
          icon={Briefcase}
          tone="yellow"
          trend={{ value: "catalogue", up: true }}
        />
        <SoftKpiCard
          label="Candidatures"
          value={stats?.applicationsTotal ?? "—"}
          hint={`${stats?.interviewsUpcoming ?? 0} entretiens`}
          icon={FileCheck}
          tone="midnight"
          trend={{ value: `${pct(byStatus.envoyee || 0)}% new`, up: true }}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <SoftCard>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-heading text-lg font-semibold text-yas-midnight">
                Usage de la plateforme
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Évolution comptes, offres et candidatures
              </p>
            </div>
            <CalendarClock className="size-5 text-slate-300" />
          </div>

          <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-slate-100">
            {[
              { c: "#5F99D2", v: byStatus.envoyee || 0 },
              { c: "#FFD100", v: byStatus.en_cours_analyse || 0 },
              { c: "#00377D", v: byStatus.entretien_programme || 0 },
              { c: "#10B981", v: byStatus.acceptee || 0 },
              { c: "#F43F5E", v: byStatus.rejetee || 0 },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  width: `${pct(s.v)}%`,
                  backgroundColor: s.c,
                  minWidth: s.v ? 4 : 0,
                }}
              />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600">
            {Object.entries(APPLICATION_STATUS_LABELS).map(([key, label]) => (
              <span key={key}>
                {label}:{" "}
                <strong className="tabular-nums">{byStatus[key] || 0}</strong>
              </span>
            ))}
          </div>

          <div className="mt-6">
            <SoftSparkline series={chartSeries} />
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-yas-midnight" /> Users
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-yas-sky" /> Offres
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-yas-yellow" /> Candidatures
              </span>
            </div>
          </div>
        </SoftCard>

        <SoftCard>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-heading text-base font-semibold text-yas-midnight">
              Accès rapide
            </h3>
          </div>
          <div className="space-y-2">
            <Button
              asChild
              className="h-11 w-full justify-between rounded-xl bg-yas-midnight text-white hover:bg-yas-midnight/90"
            >
              <Link href="/admin/utilisateurs">
                Gérer les utilisateurs
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 w-full justify-between rounded-xl border-slate-200"
            >
              <Link href="/rh/dashboard">
                Ouvrir l&apos;espace RH
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 w-full justify-between rounded-xl border-slate-200"
            >
              <Link href="/offres">
                Voir le site public
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-6 rounded-xl bg-gradient-to-br from-yas-yellow/40 to-yas-sky/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-yas-midnight/70">
              Yas Togo
            </p>
            <p className="mt-1 text-sm font-medium text-yas-midnight">
              Top Employer — gouvernance des comptes RH & candidats centralisée.
            </p>
          </div>
        </SoftCard>
      </div>

      <SoftCard className="!p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="font-heading text-base font-semibold text-yas-midnight">
              Derniers comptes
            </h3>
            <p className="text-xs text-slate-500">Utilisateurs récents</p>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-xl">
            <Link href="/admin/utilisateurs">Tout voir</Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs text-slate-500">
                <th className="px-5 py-3 font-medium">Utilisateur</th>
                <th className="px-3 py-3 font-medium">Rôle</th>
                <th className="px-3 py-3 font-medium">Statut</th>
                <th className="px-3 py-3 font-medium">Créé le</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => {
                const name = u.fullName || u.email;
                const ini = name
                  .split(/\s+/)
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <tr
                    key={u.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarFallback className="bg-yas-midnight/10 text-xs font-semibold text-yas-midnight">
                            {ini}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {u.fullName || "—"}
                          </p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-slate-600">
                      {ROLE_LABELS[u.role]}
                    </td>
                    <td className="px-3 py-3.5">
                      <SoftStatusPill
                        tone={u.isActive ? "success" : "danger"}
                      >
                        {u.isActive ? "Actif" : "Inactif"}
                      </SoftStatusPill>
                    </td>
                    <td className="px-3 py-3.5 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString("fr-FR")}
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
