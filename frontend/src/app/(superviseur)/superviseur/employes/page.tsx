"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Building2, CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { emploisApi } from "@/lib/api";
import { CONTRACT_TYPE_LABELS, EMPLOI_STATUS_LABELS } from "@/lib/constants";

export default function SuperviseurEmployesPage() {
  const { data: emplois, isLoading } = useQuery({
    queryKey: ["emplois", "me"],
    queryFn: emploisApi.me,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-yas-midnight">
          Mes collaborateurs
        </h1>
        <p className="text-muted-foreground">
          Stagiaires, CDD et CDI qui vous sont affectés pour le suivi.
        </p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Chargement...</p>}
      {!isLoading && emplois?.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Aucun collaborateur ne vous est affecté pour le moment.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {emplois?.map((emploi) => (
          <Link key={emploi.id} href={`/superviseur/employes/${emploi.id}`}>
            <Card className="h-full transition hover:border-yas-sky/40 hover:shadow-md">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <CardTitle className="font-heading text-lg text-yas-midnight">
                  {emploi.user?.fullName || emploi.user?.email}
                </CardTitle>
                <Badge>{CONTRACT_TYPE_LABELS[emploi.contractType]}</Badge>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {emploi.department && (
                  <p className="flex items-center gap-2">
                    <Building2 className="size-4 text-yas-sky" />
                    {emploi.department}
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <CalendarClock className="size-4 text-yas-sky" />
                  Depuis le{" "}
                  {new Date(emploi.startDate).toLocaleDateString("fr-FR")}
                </p>
                <div className="flex items-center justify-between pt-2">
                  <Badge variant="outline">{EMPLOI_STATUS_LABELS[emploi.status]}</Badge>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-yas-midnight">
                    Voir le suivi
                    <ArrowRight className="size-4" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
