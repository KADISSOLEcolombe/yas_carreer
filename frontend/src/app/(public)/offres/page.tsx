"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarClock,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { OfferCard } from "@/components/shared/offer-card";
import { offersApi } from "@/lib/api";
import type { OfferType } from "@/lib/types";
import {
  OFFER_DOMAINS,
  collectSkillsFromOffers,
  daysUntil,
  getDomainLabel,
  inferOfferDomain,
  offerMatchesQuery,
  offerMatchesSkills,
  type OfferDomainId,
} from "@/lib/offer-utils";
import { cn } from "@/lib/utils";

type SortKey = "recent" | "deadline" | "title";
type DeadlineFilter = "all" | "soon" | "month";

const LOCATIONS = [
  { value: "all", label: "Tout le Togo" },
  { value: "Lomé", label: "Lomé" },
  { value: "Kara", label: "Kara" },
  { value: "Atakpamé", label: "Atakpamé / Plateaux" },
  { value: "Dapaong", label: "Dapaong / Savanes" },
] as const;

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 border-b border-slate-100 pb-5 last:border-0 last:pb-0">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        {title}
      </p>
      {children}
    </div>
  );
}

export default function OffresPage() {
  const [q, setQ] = useState("");
  const [type, setType] = useState<OfferType | "all">("all");
  const [locationKey, setLocationKey] = useState("all");
  const [domains, setDomains] = useState<OfferDomainId[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [deadlineFilter, setDeadlineFilter] = useState<DeadlineFilter>("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [showFilters, setShowFilters] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");

  const { data: offers, isLoading, isError } = useQuery({
    queryKey: ["offers", "public", "all"],
    queryFn: () => offersApi.list({}),
  });

  const availableSkills = useMemo(
    () => collectSkillsFromOffers(offers ?? [], 28),
    [offers]
  );

  const filteredSkills = useMemo(() => {
    const term = skillSearch.trim().toLowerCase();
    if (!term) return availableSkills;
    return availableSkills.filter((s) => s.toLowerCase().includes(term));
  }, [availableSkills, skillSearch]);

  const domainCounts = useMemo(() => {
    const counts = Object.fromEntries(
      OFFER_DOMAINS.map((d) => [d.id, 0])
    ) as Record<OfferDomainId, number>;
    for (const offer of offers ?? []) {
      counts[inferOfferDomain(offer)] += 1;
    }
    return counts;
  }, [offers]);

  const filtered = useMemo(() => {
    let list = [...(offers ?? [])];

    list = list.filter((offer) => {
      if (!offerMatchesQuery(offer, q)) return false;
      if (type !== "all" && offer.type !== type) return false;
      if (
        locationKey !== "all" &&
        !(offer.location ?? "").toLowerCase().includes(locationKey.toLowerCase())
      ) {
        return false;
      }
      if (domains.length > 0 && !domains.includes(inferOfferDomain(offer))) {
        return false;
      }
      if (!offerMatchesSkills(offer, skills)) return false;

      const days = daysUntil(offer.deadline);
      if (deadlineFilter === "soon" && (days === null || days < 0 || days > 14)) {
        return false;
      }
      if (deadlineFilter === "month" && (days === null || days < 0 || days > 30)) {
        return false;
      }
      return true;
    });

    list.sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title, "fr");
      if (sort === "deadline") {
        const da = daysUntil(a.deadline);
        const db = daysUntil(b.deadline);
        if (da === null && db === null) return 0;
        if (da === null) return 1;
        if (db === null) return -1;
        return da - db;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }, [offers, q, type, locationKey, domains, skills, deadlineFilter, sort]);

  const stages = filtered.filter((o) => o.type === "stage").length;
  const emplois = filtered.filter((o) => o.type === "emploi").length;
  const activeFilterCount =
    (q ? 1 : 0) +
    (type !== "all" ? 1 : 0) +
    (locationKey !== "all" ? 1 : 0) +
    domains.length +
    skills.length +
    (deadlineFilter !== "all" ? 1 : 0);

  function resetFilters() {
    setQ("");
    setType("all");
    setLocationKey("all");
    setDomains([]);
    setSkills([]);
    setDeadlineFilter("all");
    setSort("recent");
    setSkillSearch("");
  }

  const filtersPanel = (
    <div className="space-y-5">
      <FilterSection title="Type de contrat">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "Tous"],
              ["emploi", "Emploi"],
              ["stage", "Stage"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setType(value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition",
                type === value
                  ? "bg-yas-midnight text-white"
                  : "bg-slate-100 text-yas-midnight hover:bg-slate-200/80"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Domaine">
        <div className="space-y-1.5">
          {OFFER_DOMAINS.map((domain) => {
            const checked = domains.includes(domain.id);
            const count = domainCounts[domain.id] ?? 0;
            return (
              <label
                key={domain.id}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-slate-50",
                  checked && "bg-yas-sky/10"
                )}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() =>
                    setDomains((prev) => toggleValue(prev, domain.id))
                  }
                />
                <span className="flex-1 text-sm text-yas-midnight">
                  {domain.label}
                </span>
                <span className="text-xs tabular-nums text-slate-400">
                  {count}
                </span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Lieu">
        <div className="space-y-1">
          {LOCATIONS.map((loc) => (
            <button
              key={loc.value}
              type="button"
              onClick={() => setLocationKey(loc.value)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition",
                locationKey === loc.value
                  ? "bg-yas-sky/10 font-medium text-yas-midnight"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <MapPin
                className={cn(
                  "size-3.5 shrink-0",
                  locationKey === loc.value ? "text-yas-sky" : "text-slate-300"
                )}
              />
              {loc.label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Compétences">
        <div className="relative mb-2">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            value={skillSearch}
            onChange={(e) => setSkillSearch(e.target.value)}
            placeholder="Rechercher une compétence…"
            className="h-9 border-0 bg-slate-50 pl-8 text-sm shadow-none"
          />
        </div>
        <div className="max-h-52 space-y-1 overflow-y-auto pr-1">
          {filteredSkills.length === 0 && (
            <p className="px-2 py-3 text-xs text-slate-400">
              Aucune compétence trouvée.
            </p>
          )}
          {filteredSkills.map((skill) => {
            const checked = skills.includes(skill);
            return (
              <label
                key={skill}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-slate-50",
                  checked && "bg-yas-yellow/20"
                )}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() =>
                    setSkills((prev) => toggleValue(prev, skill))
                  }
                />
                <span className="text-sm text-yas-midnight">{skill}</span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Date limite">
        <div className="space-y-1">
          {(
            [
              ["all", "Toutes"],
              ["soon", "Ferme sous 14 jours"],
              ["month", "Ferme sous 30 jours"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setDeadlineFilter(value)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition",
                deadlineFilter === value
                  ? "bg-yas-sky/10 font-medium text-yas-midnight"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <CalendarClock
                className={cn(
                  "size-3.5 shrink-0",
                  deadlineFilter === value ? "text-yas-sky" : "text-slate-300"
                )}
              />
              {label}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div>
      <div className="relative overflow-hidden bg-yas-midnight text-white">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 90% 20%, #FFD100 0%, transparent 35%), radial-gradient(circle at 10% 90%, #5F99D2 0%, transparent 40%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-yas-yellow">
            Yas Togo recrute
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-white sm:text-5xl">
            Toutes les opportunités
          </h1>
          <p className="mt-3 max-w-2xl text-white/75">
            Filtrez par domaine, compétences, lieu ou type de contrat — puis
            postulez en quelques minutes.
          </p>
          {!isLoading && offers && (
            <p className="mt-6 text-sm text-yas-yellow">
              {offers.length} offre{offers.length > 1 ? "s" : ""} publiée
              {offers.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Barre recherche + actions */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Métier, compétence, mot-clé…"
              className="h-12 rounded-xl border-slate-200 bg-white pl-10 shadow-sm focus-visible:ring-yas-sky"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-12 gap-2 rounded-xl border-slate-200 lg:hidden"
              onClick={() => setShowFilters((v) => !v)}
            >
              <SlidersHorizontal className="size-4" />
              Filtres
              {activeFilterCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-yas-midnight text-[11px] font-semibold text-white">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="h-12 w-[160px] rounded-xl border-slate-200 bg-white shadow-sm">
                <SelectValue placeholder="Trier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Plus récentes</SelectItem>
                <SelectItem value="deadline">Date limite</SelectItem>
                <SelectItem value="title">Titre A → Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chips filtres actifs */}
        {activeFilterCount > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {q && (
              <ActiveChip label={`« ${q} »`} onRemove={() => setQ("")} />
            )}
            {type !== "all" && (
              <ActiveChip
                label={type === "emploi" ? "Emploi" : "Stage"}
                onRemove={() => setType("all")}
              />
            )}
            {locationKey !== "all" && (
              <ActiveChip
                label={
                  LOCATIONS.find((l) => l.value === locationKey)?.label ??
                  locationKey
                }
                onRemove={() => setLocationKey("all")}
              />
            )}
            {domains.map((id) => (
              <ActiveChip
                key={id}
                label={getDomainLabel(id)}
                onRemove={() =>
                  setDomains((prev) => prev.filter((d) => d !== id))
                }
              />
            ))}
            {skills.map((skill) => (
              <ActiveChip
                key={skill}
                label={skill}
                onRemove={() =>
                  setSkills((prev) => prev.filter((s) => s !== skill))
                }
              />
            ))}
            {deadlineFilter !== "all" && (
              <ActiveChip
                label={
                  deadlineFilter === "soon"
                    ? "Sous 14 jours"
                    : "Sous 30 jours"
                }
                onRemove={() => setDeadlineFilter("all")}
              />
            )}
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-500 hover:text-yas-midnight"
            >
              <RotateCcw className="size-3" />
              Tout effacer
            </button>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Sidebar desktop */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading text-base font-semibold text-yas-midnight">
                  Filtres
                </h2>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-xs font-medium text-yas-sky hover:underline"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
              {filtersPanel}
            </div>
          </aside>

          {/* Drawer mobile */}
          {showFilters && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:hidden">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading text-base font-semibold text-yas-midnight">
                  Filtres
                </h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  Fermer
                </Button>
              </div>
              {filtersPanel}
            </div>
          )}

          <div>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-yas-midnight">
                  {filtered.length}
                </span>{" "}
                résultat{filtered.length > 1 ? "s" : ""}
                {!isLoading && (
                  <>
                    {" · "}
                    {emplois} emploi{emplois > 1 ? "s" : ""}
                    {" · "}
                    {stages} stage{stages > 1 ? "s" : ""}
                  </>
                )}
              </p>
            </div>

            {isLoading && (
              <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-56 animate-pulse rounded-2xl bg-slate-100"
                  />
                ))}
              </div>
            )}

            {isError && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center text-sm text-destructive">
                Impossible de charger les offres. Vérifiez que l&apos;API tourne.
              </div>
            )}

            {!isLoading && filtered.length === 0 && (
              <div className="rounded-2xl border border-dashed bg-white p-12 text-center">
                <p className="font-heading text-lg text-yas-midnight">
                  Aucune offre ne correspond
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Essayez d&apos;élargir vos filtres ou de retirer une compétence.
                </p>
                <Button
                  className="mt-4 rounded-xl"
                  variant="outline"
                  onClick={resetFilters}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((offer) => (
                <OfferCard key={offer.id} offer={offer} showDomain />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActiveChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 rounded-full bg-yas-midnight/5 px-3 py-1 text-xs font-medium text-yas-midnight transition hover:bg-yas-midnight/10"
    >
      {label}
      <X className="size-3 opacity-60" />
    </button>
  );
}
