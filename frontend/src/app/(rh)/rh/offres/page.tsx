"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowRight,
  Briefcase,
  CalendarClock,
  GraduationCap,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ApiError, applicationsApi, offersApi } from "@/lib/api";
import { trackRhAction } from "@/lib/track-activity";
import { OFFER_STATUS_LABELS, OFFER_TYPE_LABELS } from "@/lib/constants";
import type { Offer, OfferStatus } from "@/lib/types";
import {
  SoftCard,
  SoftPageHeader,
  SoftSearch,
  SoftStatusPill,
  SoftTabs,
  SoftToolbar,
  statusTone,
} from "@/components/shared/soft-ui";
import {
  EMPTY_OFFER_FORM,
  OfferComposerDialog,
  type OfferFormValues,
} from "@/components/shared/offer-composer-dialog";
import { daysUntil, isOfferExpired, splitSkills } from "@/lib/offer-utils";

export default function RhOffresPage() {
  const queryClient = useQueryClient();
  const { data: offers, isLoading } = useQuery({
    queryKey: ["offers", "rh-all"],
    queryFn: () => offersApi.list(),
  });
  const { data: applications } = useQuery({
    queryKey: ["applications", "rh", "all"],
    queryFn: () => applicationsApi.list(),
  });

  const appsByOffer = useMemo(() => {
    const map: Record<number, number> = {};
    for (const app of applications ?? []) {
      map[app.offerId] = (map[app.offerId] || 0) + 1;
    }
    return map;
  }, [applications]);

  const [statusTab, setStatusTab] = useState<OfferStatus | "all">("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [formValues, setFormValues] = useState<OfferFormValues>(EMPTY_OFFER_FORM);

  const counts = useMemo(() => {
    const map: Record<string, number> = {
      all: offers?.length ?? 0,
      publiee: 0,
      brouillon: 0,
      fermee: 0,
    };
    for (const o of offers ?? []) map[o.status] = (map[o.status] || 0) + 1;
    return map;
  }, [offers]);

  const filtered = useMemo(() => {
    let list = offers ?? [];
    if (statusTab !== "all") list = list.filter((o) => o.status === statusTab);
    if (q.trim()) {
      const term = q.toLowerCase();
      list = list.filter(
        (o) =>
          o.title.toLowerCase().includes(term) ||
          (o.location || "").toLowerCase().includes(term)
      );
    }
    return list;
  }, [offers, statusTab, q]);

  function openCreate() {
    setEditing(null);
    setFormValues(EMPTY_OFFER_FORM);
    setOpen(true);
    trackRhAction(
      "ui.open_offer_composer",
      "Ouverture du composer de nouvelle offre",
      { category: "ui" }
    );
  }

  function openEdit(offer: Offer) {
    setEditing(offer);
    setFormValues({
      title: offer.title,
      type: offer.type,
      description: offer.description,
      requirements: offer.requirements || "",
      deadline: offer.deadline ? offer.deadline.slice(0, 10) : "",
      location: offer.location || "",
      status: offer.status,
    });
    setOpen(true);
    trackRhAction(
      "ui.open_offer_edit",
      `Ouverture édition offre « ${offer.title} »`,
      {
        category: "ui",
        resourceType: "offer",
        resourceId: offer.id,
      }
    );
  }

  const saveMutation = useMutation({
    mutationFn: (values: OfferFormValues) => {
      const payload = {
        title: values.title,
        type: values.type,
        description: values.description,
        requirements: values.requirements || undefined,
        deadline: values.deadline || undefined,
        location: values.location || undefined,
        status: values.status,
      };
      return editing
        ? offersApi.update(editing.id, payload)
        : offersApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      toast.success(editing ? "Offre mise à jour" : "Offre créée");
      setOpen(false);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Erreur lors de l'enregistrement"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => offersApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      toast.success("Offre supprimée");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "Suppression impossible"
      );
    },
  });

  const tabs = [
    { value: "all", label: "Toutes", count: counts.all },
    { value: "publiee", label: "Publiées", count: counts.publiee },
    { value: "brouillon", label: "Brouillons", count: counts.brouillon },
    { value: "fermee", label: "Fermées", count: counts.fermee },
  ];

  return (
    <div>
      <SoftPageHeader
        title="Offres"
        description="Créez une offre en dictant ou en écrivant un brief — l'IA remplit le reste."
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={openCreate}
              variant="outline"
              className="h-10 gap-2 rounded-xl border-yas-sky/40 text-yas-midnight"
            >
              <Sparkles className="size-4 text-yas-sky" />
              Créer avec l&apos;IA
            </Button>
            <Button
              onClick={openCreate}
              className="h-10 gap-2 rounded-xl bg-yas-midnight px-4 text-white hover:bg-yas-midnight/90"
            >
              <Plus className="size-4" />
              Nouvelle offre
            </Button>
          </div>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
        }
      />

      <SoftToolbar>
        <SoftTabs
          items={tabs}
          value={statusTab}
          onChange={(v) => setStatusTab(v as OfferStatus | "all")}
        />
        <SoftSearch
          value={q}
          onChange={setQ}
          placeholder="Rechercher une offre…"
        />
      </SoftToolbar>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-2xl bg-slate-100"
            />
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <SoftCard className="py-16 text-center">
          <p className="text-slate-400">Aucune offre dans ce filtre.</p>
          <Button
            onClick={openCreate}
            className="mt-4 gap-2 rounded-xl bg-yas-midnight"
          >
            <Sparkles className="size-4" />
            Créer avec l&apos;IA
          </Button>
        </SoftCard>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((offer) => {
          const skills = splitSkills(offer.requirements).slice(0, 3);
          const days = daysUntil(offer.deadline);
          const expired = isOfferExpired(offer.deadline);
          const appCount = appsByOffer[offer.id] || 0;
          const excerpt = offer.description
            .split("\n")
            .map((l) => l.trim())
            .filter(
              (l) =>
                l && !/^(à propos|missions|profil|ce que|durée)/i.test(l)
            )
            .join(" ")
            .slice(0, 140);

          return (
            <SoftCard
              key={offer.id}
              className="group relative flex flex-col !p-0 overflow-hidden transition hover:shadow-md"
            >
              <Link
                href={`/rh/offres/${offer.id}`}
                className="flex flex-1 flex-col p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <SoftStatusPill tone={statusTone(offer.status)}>
                    {OFFER_STATUS_LABELS[offer.status]}
                  </SoftStatusPill>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    {offer.type === "stage" ? (
                      <GraduationCap className="size-3.5" />
                    ) : (
                      <Briefcase className="size-3.5" />
                    )}
                    {OFFER_TYPE_LABELS[offer.type]}
                  </span>
                </div>

                <h3 className="mt-3 font-heading text-lg font-semibold leading-snug text-yas-midnight transition group-hover:text-yas-sky">
                  {offer.title}
                </h3>
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-500">
                  {excerpt}
                  {excerpt.length >= 140 ? "…" : ""}
                </p>

                <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-slate-500">
                  {offer.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5 text-yas-sky" />
                      {offer.location}
                    </span>
                  )}
                  {offer.deadline && (
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock className="size-3.5 text-yas-sky" />
                      {expired
                        ? `Clôturée — deadline dépassée (${new Date(offer.deadline).toLocaleDateString("fr-FR")})`
                        : days != null && days >= 0
                          ? `${days} j restants`
                          : new Date(offer.deadline).toLocaleDateString("fr-FR")}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-3.5 text-yas-sky" />
                    {appCount} candidature{appCount > 1 ? "s" : ""}
                  </span>
                </div>

                {skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-yas-midnight opacity-80 group-hover:opacity-100">
                  Voir le détail
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>

              <div className="absolute right-2 top-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-lg bg-white/90 shadow-sm"
                      onClick={(e) => e.preventDefault()}
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(offer)}>
                      <Pencil className="size-4" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => {
                        if (confirm(`Supprimer « ${offer.title} » ?`)) {
                          deleteMutation.mutate(offer.id);
                        }
                      }}
                    >
                      <Trash2 className="size-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </SoftCard>
          );
        })}
      </div>

      <OfferComposerDialog
        open={open}
        onOpenChange={setOpen}
        mode={editing ? "edit" : "create"}
        initialValues={formValues}
        saving={saveMutation.isPending}
        onSave={(values) => saveMutation.mutate(values)}
      />
    </div>
  );
}
