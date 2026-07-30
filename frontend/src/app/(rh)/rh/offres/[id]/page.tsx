"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Briefcase,
  CalendarClock,
  MapPin,
  Pencil,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError, applicationsApi, offersApi } from "@/lib/api";
import { OFFER_STATUS_LABELS, OFFER_TYPE_LABELS } from "@/lib/constants";
import {
  SoftCard,
  SoftStatusPill,
  statusTone,
} from "@/components/shared/soft-ui";
import {
  OfferComposerDialog,
  type OfferFormValues,
} from "@/components/shared/offer-composer-dialog";
import { AiRankingDialog } from "@/components/shared/ai-ranking-dialog";
import { OfferAiAnalysisPanel } from "@/components/shared/offer-ai-analysis-panel";
import {
  daysUntil,
  parseOfferSections,
  splitSkills,
} from "@/lib/offer-utils";

export default function RhOfferDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [formValues, setFormValues] = useState<OfferFormValues | null>(null);
  const [rankOpen, setRankOpen] = useState(false);

  const { data: offer, isLoading } = useQuery({
    queryKey: ["offer", id],
    queryFn: () => offersApi.get(id),
  });

  const { data: applications, isLoading: loadingApps } = useQuery({
    queryKey: ["applications", "offer", id],
    queryFn: () => applicationsApi.list({ offerId: Number(id) }),
  });

  function openEdit() {
    if (!offer) return;
    setFormValues({
      title: offer.title,
      type: offer.type,
      description: offer.description,
      requirements: offer.requirements || "",
      deadline: offer.deadline ? offer.deadline.slice(0, 10) : "",
      location: offer.location || "",
      status: offer.status,
    });
    setEditOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: (values: OfferFormValues) =>
      offersApi.update(Number(id), {
        title: values.title,
        type: values.type,
        description: values.description,
        requirements: values.requirements || undefined,
        deadline: values.deadline || undefined,
        location: values.location || undefined,
        status: values.status,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offer", id] });
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      toast.success("Offre mise à jour");
      setEditOpen(false);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "Mise à jour impossible"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => offersApi.remove(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      toast.success("Offre supprimée");
      router.push("/rh/offres");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "Suppression impossible"
      );
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (!offer) {
    return (
      <SoftCard className="py-16 text-center">
        <p className="font-heading text-lg text-yas-midnight">
          Offre introuvable
        </p>
        <Button asChild variant="outline" className="mt-4 rounded-xl">
          <Link href="/rh/offres">Retour aux offres</Link>
        </Button>
      </SoftCard>
    );
  }

  const sections = parseOfferSections(offer.description);
  const skills = splitSkills(offer.requirements);
  const days = daysUntil(offer.deadline);
  const totalApps = applications?.length ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/rh/offres"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-yas-midnight"
        >
          <ArrowLeft className="size-4" />
          Toutes les offres
        </Link>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="h-10 gap-2 rounded-xl border-yas-sky/40 text-yas-midnight"
            onClick={() => setRankOpen(true)}
          >
            <Trophy className="size-4 text-yas-sky" />
            Classement IA
          </Button>
          <Button
            variant="outline"
            className="h-10 gap-2 rounded-xl border-slate-200"
            onClick={openEdit}
          >
            <Pencil className="size-4" />
            Modifier
          </Button>
          <Button
            variant="outline"
            className="h-10 gap-2 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
            onClick={() => {
              if (confirm(`Supprimer « ${offer.title} » ?`)) {
                deleteMutation.mutate();
              }
            }}
          >
            <Trash2 className="size-4" />
            Supprimer
          </Button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <SoftCard>
            <div className="flex flex-wrap gap-2">
              <SoftStatusPill tone={statusTone(offer.status)}>
                {OFFER_STATUS_LABELS[offer.status]}
              </SoftStatusPill>
              <SoftStatusPill tone="info">
                {OFFER_TYPE_LABELS[offer.type]}
              </SoftStatusPill>
            </div>
            <h1 className="mt-3 font-heading text-2xl font-bold text-yas-midnight sm:text-3xl">
              {offer.title}
            </h1>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
              {offer.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4 text-yas-sky" />
                  {offer.location}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="size-4 text-yas-sky" />
                {OFFER_TYPE_LABELS[offer.type]}
              </span>
              {offer.deadline && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock className="size-4 text-yas-sky" />
                  {days != null && days >= 0
                    ? `Clôture dans ${days} j`
                    : new Date(offer.deadline).toLocaleDateString("fr-FR")}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-4 text-yas-sky" />
                {totalApps} candidature{totalApps > 1 ? "s" : ""}
              </span>
            </div>
          </SoftCard>

          {sections.map((section) => (
            <SoftCard key={section.title}>
              <h2 className="font-heading text-lg font-semibold text-yas-midnight">
                {section.title}
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {section.body}
              </p>
            </SoftCard>
          ))}

          {skills.length > 0 && (
            <SoftCard>
              <h2 className="font-heading text-lg font-semibold text-yas-midnight">
                Compétences requises
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-yas-midnight/5 px-3 py-1.5 text-sm font-medium text-yas-midnight"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </SoftCard>
          )}
        </div>

        <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <OfferAiAnalysisPanel
            offer={offer}
            applications={applications ?? []}
            loading={loadingApps}
          />

          <SoftCard className="bg-gradient-to-br from-yas-yellow/30 to-yas-sky/15">
            <p className="text-xs font-semibold uppercase tracking-wider text-yas-midnight/70">
              Lien public
            </p>
            <p className="mt-1 text-sm text-yas-midnight">
              Les candidats voient cette offre sur le site YasCareer.
            </p>
            <Button
              asChild
              variant="outline"
              className="mt-3 h-9 rounded-xl border-yas-midnight/20 bg-white/80"
            >
              <Link href={`/offres/${offer.id}`} target="_blank">
                Ouvrir la page publique
              </Link>
            </Button>
          </SoftCard>
        </div>
      </div>

      {formValues && (
        <OfferComposerDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          mode="edit"
          initialValues={formValues}
          saving={saveMutation.isPending}
          onSave={(values) => saveMutation.mutate(values)}
        />
      )}

      <AiRankingDialog
        open={rankOpen}
        onOpenChange={setRankOpen}
        initialOfferId={Number(id)}
      />
    </div>
  );
}
