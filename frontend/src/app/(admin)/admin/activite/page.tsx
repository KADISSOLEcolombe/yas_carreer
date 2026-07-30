"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Briefcase,
  CalendarClock,
  FileText,
  MousePointerClick,
  Sparkles,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  activityLogsApi,
  type ActivityLogEntry,
} from "@/lib/api";
import { ROLE_LABELS } from "@/lib/constants";
import {
  SoftCard,
  SoftPageHeader,
  SoftSearch,
  SoftToolbar,
} from "@/components/shared/soft-ui";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<string, string> = {
  offer: "Offres",
  application: "Candidatures",
  interview: "Entretiens",
  user: "Utilisateurs",
  ui: "Interface",
  general: "Général",
};

function categoryIcon(category: string) {
  switch (category) {
    case "offer":
      return Briefcase;
    case "application":
      return FileText;
    case "interview":
      return CalendarClock;
    case "user":
      return Users;
    case "ui":
      return MousePointerClick;
    default:
      return Activity;
  }
}

function initials(name?: string | null, email?: string) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
  }
  return (email?.slice(0, 2) || "?").toUpperCase();
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AdminActivityPage() {
  const [userId, setUserId] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [q, setQ] = useState("");

  const { data: summary = [] } = useQuery({
    queryKey: ["activity-logs", "summary"],
    queryFn: () => activityLogsApi.summary(),
  });

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["activity-logs", userId, category, q],
    queryFn: () =>
      activityLogsApi.list({
        userId: userId === "all" ? undefined : Number(userId),
        category: category === "all" ? undefined : category,
        q: q.trim() || undefined,
        limit: 150,
      }),
  });

  const rhOnly = useMemo(
    () => summary.filter((s) => s.user.role === "rh"),
    [summary]
  );

  return (
    <div>
      <SoftPageHeader
        title="Traçabilité RH"
        description="Suivez les actions de chaque RH : offres, candidatures, entretiens, emails et clics métier."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rhOnly.length === 0 ? (
          <SoftCard className="sm:col-span-2 lg:col-span-3">
            <p className="text-sm text-slate-500">
              Aucun RH actif pour le moment. Créez un compte RH pour commencer
              le suivi.
            </p>
          </SoftCard>
        ) : (
          rhOnly.map((row) => (
            <button
              key={row.user.id}
              type="button"
              onClick={() =>
                setUserId((prev) =>
                  prev === String(row.user.id) ? "all" : String(row.user.id)
                )
              }
              className={cn(
                "rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-yas-sky/40",
                userId === String(row.user.id)
                  ? "border-yas-sky ring-2 ring-yas-sky/20"
                  : "border-slate-200"
              )}
            >
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarFallback className="bg-yas-midnight text-xs text-white">
                    {initials(row.user.fullName, row.user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-yas-midnight">
                    {row.user.fullName || row.user.email}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {ROLE_LABELS[row.user.role]}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold tabular-nums text-yas-midnight">
                {row.totalActions}
              </p>
              <p className="text-xs text-slate-500">actions enregistrées</p>
              {row.lastSummary && (
                <p className="mt-2 line-clamp-2 text-xs text-slate-400">
                  Dernière : {row.lastSummary}
                </p>
              )}
            </button>
          ))
        )}
      </div>

      <SoftToolbar>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={userId} onValueChange={setUserId}>
            <SelectTrigger className="h-10 w-[200px] rounded-xl bg-white">
              <SelectValue placeholder="Tous les RH" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les acteurs</SelectItem>
              {summary.map((s) => (
                <SelectItem key={s.user.id} value={String(s.user.id)}>
                  {s.user.fullName || s.user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-10 w-[160px] rounded-xl bg-white">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes catégories</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <SoftSearch
            value={q}
            onChange={setQ}
            placeholder="Rechercher une action…"
          />
        </div>
        {(userId !== "all" || category !== "all" || q) && (
          <Button
            variant="ghost"
            className="h-9 rounded-xl"
            onClick={() => {
              setUserId("all");
              setCategory("all");
              setQ("");
            }}
          >
            Réinitialiser
          </Button>
        )}
      </SoftToolbar>

      <SoftCard className="!p-0 overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Sparkles className="mx-auto size-10 text-slate-300" />
            <p className="mt-3 font-heading text-lg font-semibold text-yas-midnight">
              Aucune activité
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Les actions RH apparaîtront ici dès qu’ils utilisent la plateforme.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {logs.map((log: ActivityLogEntry) => {
              const Icon = categoryIcon(log.category);
              return (
                <li
                  key={log.id}
                  className="flex items-start gap-3 px-4 py-3.5 sm:px-5"
                >
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-yas-midnight/5 text-yas-midnight">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-yas-sky">
                        {CATEGORY_LABELS[log.category] || log.category}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-500">
                        {log.action}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-snug text-slate-800">
                      {log.summary}
                    </p>
                    <p className="mt-1.5 text-xs text-slate-400">
                      <span className="font-medium text-slate-600">
                        {log.user?.fullName || log.user?.email || `User #${log.userId}`}
                      </span>
                      {" · "}
                      {formatWhen(log.createdAt)}
                      {log.ipAddress ? ` · IP ${log.ipAddress}` : ""}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SoftCard>
    </div>
  );
}
