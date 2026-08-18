"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { CalendarCheck, CalendarClock, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { interviewRequestsApi, interviewsApi, emploisApi } from "@/lib/api";
import { SoftCard } from "@/components/shared/soft-ui";

const BRAND_TONES = ["bg-yas-midnight", "bg-yas-sky", "bg-yas-yellow"] as const;

function StatRow({
  icon: Icon,
  title,
  metrics,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  metrics: { label: string; value: number }[];
}) {
  const total = metrics.reduce((sum, m) => sum + m.value, 0);
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <Icon className="size-4 text-yas-sky" />
          {title}
        </span>
        <span className="text-xs text-slate-400">
          {total} au total
        </span>
      </div>
      <div className="flex h-3 overflow-hidden rounded-full bg-slate-100">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            title={`${m.label}: ${m.value}`}
            className={BRAND_TONES[i % BRAND_TONES.length]}
            style={{
              width: `${pct(m.value)}%`,
              minWidth: m.value ? 4 : 0,
            }}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {metrics.map((m, i) => (
          <span key={m.label} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className={`size-2.5 rounded-full ${BRAND_TONES[i % BRAND_TONES.length]}`} />
            {m.label} {m.value} ({pct(m.value)}%)
          </span>
        ))}
      </div>
    </div>
  );
}

export default function SuperviseurDashboardPage() {
  const { data: requests } = useQuery({
    queryKey: ["interview-requests", "me"],
    queryFn: interviewRequestsApi.me,
  });
  const { data: interviews } = useQuery({
    queryKey: ["interviews", "me", "superviseur"],
    queryFn: interviewsApi.me,
  });
  const { data: emplois } = useQuery({
    queryKey: ["emplois", "me"],
    queryFn: emploisApi.me,
  });

  const pendingRequests = requests?.filter((r) => r.status === "en_attente").length ?? 0;
  const upcomingInterviews =
    interviews?.filter((i) => i.status === "planifie").length ?? 0;
  const activeEmplois = emplois?.filter((e) => e.status === "actif").length ?? 0;

  const confirmedRequests = requests?.filter((r) => r.status === "disponible").length ?? 0;
  const unavailableRequests = requests?.filter((r) => r.status === "indisponible").length ?? 0;

  const completedInterviews = interviews?.filter((i) => i.status === "termine").length ?? 0;
  const cancelledInterviews = interviews?.filter((i) => i.status === "annule").length ?? 0;

  const now = new Date();
  const ongoingEmplois =
    emplois?.filter((e) => e.status === "actif" && new Date(e.startDate) <= now).length ?? 0;
  const upcomingEmplois =
    emplois?.filter((e) => e.status === "actif" && new Date(e.startDate) > now).length ?? 0;
  const terminatedEmplois = emplois?.filter((e) => e.status === "termine").length ?? 0;

  const stats = [
    {
      label: "Disponibilités à confirmer",
      value: pendingRequests,
      icon: CalendarCheck,
      href: "/superviseur/disponibilites",
    },
    {
      label: "Entretiens à venir",
      value: upcomingInterviews,
      icon: CalendarClock,
      href: "/superviseur/entretiens",
    },
    {
      label: "Collaborateurs suivis",
      value: activeEmplois,
      icon: Users,
      href: "/superviseur/employes",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-yas-midnight">
          Tableau de bord
        </h1>
        <p className="text-muted-foreground">
          Vue d&apos;ensemble de vos entretiens et collaborateurs affectés.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="transition hover:border-yas-sky/40 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="size-5 text-yas-sky" />
              </CardHeader>
              <CardContent>
                <p className="font-heading text-3xl font-bold text-yas-midnight">
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <SoftCard className="space-y-5">
        <h2 className="font-heading text-lg font-semibold text-yas-midnight">
          Statistiques
        </h2>
        <StatRow
          icon={CalendarCheck}
          title="Disponibilités"
          metrics={[
            { label: "En attente", value: pendingRequests },
            { label: "Confirmées", value: confirmedRequests },
            { label: "Indisponibles", value: unavailableRequests },
          ]}
        />
        <StatRow
          icon={CalendarClock}
          title="Entretiens"
          metrics={[
            { label: "À venir", value: upcomingInterviews },
            { label: "Réalisés", value: completedInterviews },
            { label: "Annulés", value: cancelledInterviews },
          ]}
        />
        <StatRow
          icon={Users}
          title="Collaborateurs"
          metrics={[
            { label: "En cours", value: ongoingEmplois },
            { label: "À venir", value: upcomingEmplois },
            { label: "Terminées", value: terminatedEmplois },
          ]}
        />
      </SoftCard>
    </div>
  );
}
