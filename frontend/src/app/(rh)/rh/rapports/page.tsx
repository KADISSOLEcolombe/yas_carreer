"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { supervisionNotesApi, fileUrl } from "@/lib/api";
import { RECOMMENDATION_LABELS, SUPERVISION_NOTE_TYPE_LABELS } from "@/lib/constants";
import {
  SoftCard,
  SoftPageHeader,
  SoftSearch,
  SoftStatusPill,
  SoftTabs,
  SoftToolbar,
} from "@/components/shared/soft-ui";
import type { SupervisionNoteType } from "@/lib/types";

export default function RhRapportsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<SupervisionNoteType | "all">("all");

  const { data: reports, isLoading } = useQuery({
    queryKey: ["supervision-notes", "all"],
    queryFn: () => supervisionNotesApi.list(),
  });

  const counts = useMemo(() => {
    const map: Record<string, number> = {
      all: reports?.length ?? 0,
      rapport: 0,
      observation: 0,
      evaluation: 0,
    };
    for (const r of reports ?? []) map[r.type] = (map[r.type] || 0) + 1;
    return map;
  }, [reports]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (reports ?? []).filter((report) => {
      if (typeFilter !== "all" && report.type !== typeFilter) return false;
      if (!term) return true;

      const isEvaluation = Boolean(report.applicationId);
      const person = isEvaluation ? report.application?.user : report.emploi?.user;
      const context = isEvaluation
        ? report.application?.offer?.title
        : (report.emploi?.application?.offer?.title ?? report.emploi?.department);
      const haystack = [
        person?.fullName,
        person?.email,
        context,
        report.author?.fullName,
        report.author?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [reports, search, typeFilter]);

  const tabs = [
    { value: "all", label: "Tous", count: counts.all },
    { value: "evaluation", label: "Évaluations d'entretien", count: counts.evaluation },
    { value: "rapport", label: "Rapports de suivi", count: counts.rapport },
    { value: "observation", label: "Observations", count: counts.observation },
  ];

  return (
    <div>
      <SoftPageHeader
        title="Rapports"
        description="Rapports d'entretien et de suivi envoyés par les superviseurs."
      />

      <SoftToolbar>
        <SoftTabs
          items={tabs}
          value={typeFilter}
          onChange={(v) => setTypeFilter(v as SupervisionNoteType | "all")}
        />
        <SoftSearch
          value={search}
          onChange={setSearch}
          placeholder="Rechercher un nom, une offre, un superviseur…"
        />
      </SoftToolbar>

      {isLoading && <p className="text-sm text-muted-foreground">Chargement...</p>}
      {!isLoading && reports?.length === 0 && (
        <SoftCard>
          <p className="py-10 text-center text-muted-foreground">
            Aucun rapport envoyé pour le moment.
          </p>
        </SoftCard>
      )}
      {!isLoading && reports && reports.length > 0 && filtered.length === 0 && (
        <SoftCard>
          <p className="py-10 text-center text-muted-foreground">
            Aucun rapport ne correspond à cette recherche.
          </p>
        </SoftCard>
      )}

      {!isLoading && filtered.length > 0 && (
        <SoftCard className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-xs text-slate-500">
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-3 py-3 font-medium">Personne</th>
                  <th className="px-3 py-3 font-medium">Offre / Poste</th>
                  <th className="px-3 py-3 font-medium">Superviseur</th>
                  <th className="px-3 py-3 font-medium">Date</th>
                  <th className="px-3 py-3 font-medium">Recommandation</th>
                  <th className="w-32 px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((report) => {
                  const isEvaluation = Boolean(report.applicationId);
                  const person = isEvaluation
                    ? report.application?.user
                    : report.emploi?.user;
                  const context = isEvaluation
                    ? report.application?.offer?.title
                    : (report.emploi?.application?.offer?.title ?? report.emploi?.department);

                  return (
                    <tr
                      key={report.id}
                      className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/70"
                    >
                      <td className="px-4 py-3.5">
                        <SoftStatusPill tone={isEvaluation ? "info" : "neutral"}>
                          {SUPERVISION_NOTE_TYPE_LABELS[report.type]}
                        </SoftStatusPill>
                      </td>
                      <td className="px-3 py-3.5 font-semibold text-slate-800">
                        {person?.fullName || person?.email || "—"}
                      </td>
                      <td className="max-w-[200px] truncate px-3 py-3.5 text-foreground">
                        {context ?? "—"}
                      </td>
                      <td className="px-3 py-3.5 text-slate-600">
                        {report.author?.fullName || report.author?.email || "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3.5 text-slate-500">
                        {new Date(report.createdAt).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-3 py-3.5 text-muted-foreground">
                        {report.recommendation
                          ? RECOMMENDATION_LABELS[report.recommendation]
                          : "—"}
                      </td>
                      <td className="px-3 py-3.5 text-right">
                        {report.fichierRapport ? (
                          <a
                            href={fileUrl(report.fichierRapport) || undefined}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-yas-midnight hover:underline"
                          >
                            <Download className="size-3.5" />
                            Télécharger
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">En cours…</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SoftCard>
      )}
    </div>
  );
}
