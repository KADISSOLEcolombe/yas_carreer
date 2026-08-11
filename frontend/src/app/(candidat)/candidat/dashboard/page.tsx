"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, FileText, Heart, UploadCloud } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ApplicationStepper } from "@/components/shared/application-stepper";
import { OfferCard } from "@/components/shared/offer-card";
import { applicationsApi, authApi, offersApi } from "@/lib/api";
import { computeProfileCompletion } from "@/lib/candidate-profile";
import { getFavoriteIds, FAVORITES_CHANGED_EVENT } from "@/lib/favorites";
import { fileUrl } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

function initials(name?: string | null, email?: string) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
  }
  return (email?.slice(0, 2) || "?").toUpperCase();
}

export default function CandidatDashboardPage() {
  const authUser = useAuthStore((state) => state.user);

  const { data: me } = useQuery({ queryKey: ["auth", "me"], queryFn: authApi.me });
  const { data: applications } = useQuery({
    queryKey: ["applications", "me"],
    queryFn: applicationsApi.me,
  });
  const { data: offers } = useQuery({
    queryKey: ["offers", "all"],
    queryFn: () => offersApi.list(),
  });

  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  useEffect(() => {
    function refresh() {
      setFavoriteIds(getFavoriteIds(authUser?.id));
    }
    refresh();
    window.addEventListener(FAVORITES_CHANGED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(FAVORITES_CHANGED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [authUser?.id]);

  const favoriteOffers = useMemo(
    () => (offers ?? []).filter((o) => favoriteIds.includes(o.id)).slice(0, 3),
    [offers, favoriteIds]
  );

  const recentApplications = applications?.slice(0, 3) ?? [];
  const completion = computeProfileCompletion(me?.user, me?.profile);
  const cvUrl = fileUrl(me?.profile?.cvUrl);

  return (
    <div className="space-y-6">
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
              {cvUrl ? (
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2 text-sm text-yas-midnight hover:bg-slate-100"
                >
                  <FileText className="size-4 shrink-0 text-yas-sky" />
                  <span className="truncate">Curriculum Vitae</span>
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">Aucun CV importé.</p>
              )}
              <Button asChild variant="outline" className="w-full gap-2 rounded-xl">
                <Link href="/candidat/profil">
                  <UploadCloud className="size-4" />
                  Mettre à jour le CV
                </Link>
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

      {/* Mes favoris */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-yas-midnight">
            Mes favoris
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/candidat/favoris">Voir tout</Link>
          </Button>
        </div>

        {favoriteOffers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
              <Heart className="size-5 text-yas-sky" />
              <p className="text-sm">
                Ajoutez des offres en favoris pour les retrouver ici.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {favoriteOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
