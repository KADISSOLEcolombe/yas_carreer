"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { CalendarCheck, CalendarClock, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { interviewRequestsApi, interviewsApi, emploisApi } from "@/lib/api";

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
    </div>
  );
}
