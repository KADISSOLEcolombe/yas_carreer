"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, FileText, Sparkles, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ApplicationStepper } from "@/components/shared/application-stepper";
import { OfferCard } from "@/components/shared/offer-card";
import { CompleteProfileDialog } from "@/components/shared/complete-profile-dialog";
import { applicationsApi, authApi, candidateDocumentsApi, offersApi } from "@/lib/api";
import { computeProfileCompletion } from "@/lib/candidate-profile";
import { getPendingOffer, clearPendingOffer } from "@/lib/pending-application";
import { getRelevantOffersForCandidate, isOfferExpired } from "@/lib/offer-utils";

function initials(name?: string | null, email?: string) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
  }
  return (email?.slice(0, 2) || "?").toUpperCase();
}

export default function CandidatDashboardPage() {
  const router = useRouter();

  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  useEffect(() => {
    const justRegistered = window.sessionStorage.getItem("yas_just_registered");
    if (justRegistered) {
      window.sessionStorage.removeItem("yas_just_registered");
      setShowCompleteProfile(true);
    }
  }, []);

  const [pendingOffer, setPendingOfferState] = useState(() => getPendingOffer());
  const { data: pendingOfferDetail, isError: pendingOfferInvalid } = useQuery({
    queryKey: ["offer", "pending", pendingOffer?.offerId],
    queryFn: () => offersApi.get(pendingOffer!.offerId),
    enabled: !!pendingOffer,
    retry: false,
  });
  useEffect(() => {
    if (!pendingOffer) return;
    const invalid =
      pendingOfferInvalid ||
      (pendingOfferDetail && isOfferExpired(pendingOfferDetail.deadline));
    if (invalid) {
      clearPendingOffer();
      setPendingOfferState(null);
    }
  }, [pendingOffer, pendingOfferInvalid, pendingOfferDetail]);

  const { data: me } = useQuery({ queryKey: ["auth", "me"], queryFn: authApi.me });
  const { data: applications } = useQuery({
    queryKey: ["applications", "me"],
    queryFn: applicationsApi.me,
  });
  const { data: offers } = useQuery({
    queryKey: ["offers", "all"],
    queryFn: () => offersApi.list(),
  });
  const { data: documents } = useQuery({
    queryKey: ["candidate-documents"],
    queryFn: candidateDocumentsApi.list,
  });

  const relevantOffers = useMemo(
    () => getRelevantOffersForCandidate(offers ?? [], me?.profile?.skills, 5),
    [offers, me?.profile?.skills]
  );

  const recentApplications = applications?.slice(0, 3) ?? [];
  const documentCount = documents?.length ?? 0;
  const completion = computeProfileCompletion(me?.user, me?.profile, documentCount > 0);

  return (
    <div className="space-y-6">
      <CompleteProfileDialog
        open={showCompleteProfile}
        onOpenChange={setShowCompleteProfile}
      />

      {pendingOffer && !pendingOfferInvalid && (
        <Card className="border-yas-sky/30 bg-yas-sky/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-yas-sky/15 text-yas-midnight">
                <Briefcase className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-yas-midnight">
                  Offre en attente
                  {pendingOfferDetail ? ` : ${pendingOfferDetail.title}` : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  Reprenez votre candidature là où vous l&apos;aviez laissée.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="midnight"
                onClick={() =>
                  router.push(`/offres/${pendingOffer.offerId}?apply=1`)
                }
              >
                Reprendre ma candidature
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Ignorer"
                onClick={() => {
                  clearPendingOffer();
                  setPendingOfferState(null);
                }}
              >
                <X className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        {/* Mes candidatures */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-heading text-lg text-yas-midnight">
              Mes candidatures
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/candidat/candidatures">Voir tout</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentApplications.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Vous n&apos;avez pas encore postulé.{" "}
                <Link href="/offres" className="text-yas-midnight underline">
                  Découvrir les offres
                </Link>
              </p>
            )}
            {recentApplications.map((app) => (
              <div
                key={app.id}
                className="rounded-xl border border-slate-100 p-4 transition hover:border-yas-sky/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-yas-sky/10 text-yas-midnight">
                      <Briefcase className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <Link
                        href={`/offres/${app.offerId}`}
                        className="font-semibold text-yas-midnight hover:underline"
                      >
                        {app.offer?.title ?? `Offre #${app.offerId}`}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {app.offer?.location || "Yas Togo"}
                      </p>
                    </div>
                  </div>
                </div>
                <ApplicationStepper status={app.status} className="mt-4" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Mon profil */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg text-yas-midnight">
              Mon profil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar size="lg">
                <AvatarFallback className="bg-yas-midnight text-sm font-semibold text-white">
                  {initials(me?.user.fullName, me?.user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-semibold text-yas-midnight">
                  {me?.user.fullName || me?.user.email}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {me?.profile?.skills?.split(",")[0]?.trim() || "Candidat YasCareer"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Documents
              </p>
              <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2 text-sm text-slate-600">
                <FileText className="size-4 shrink-0 text-yas-sky" />
                {documentCount > 0
                  ? `${documentCount} document${documentCount > 1 ? "s" : ""} enregistré${documentCount > 1 ? "s" : ""}`
                  : "Aucun document enregistré."}
              </div>
              <Button asChild variant="outline" className="w-full gap-2 rounded-xl">
                <Link href="/candidat/profil">Gérer mes documents</Link>
              </Button>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">
                  Profil complété
                </span>
                <span className="font-semibold text-yas-midnight">
                  {completion}%
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-yas-yellow transition-all"
                  style={{ width: `${completion}%` }}
                />
              </div>
              {completion < 100 && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Complétez votre{" "}
                  <Link href="/candidat/profil" className="underline">
                    profil
                  </Link>{" "}
                  pour atteindre 100%.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Offres recommandées */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="size-4 text-yas-sky" />
          <h2 className="font-heading text-lg font-semibold text-yas-midnight">
            Offres recommandées
          </h2>
        </div>

        {relevantOffers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
              <Sparkles className="size-5 text-yas-sky" />
              <p className="text-sm">
                Ajoutez des compétences à votre{" "}
                <Link href="/candidat/profil" className="underline">
                  profil
                </Link>{" "}
                pour voir des offres recommandées.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {relevantOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
