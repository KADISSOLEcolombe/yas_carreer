"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OfferCard } from "@/components/shared/offer-card";
import { offersApi } from "@/lib/api";
import { getFavoriteIds, FAVORITES_CHANGED_EVENT } from "@/lib/favorites";
import { useAuthStore } from "@/lib/auth-store";

export default function CandidatFavorisPage() {
  const user = useAuthStore((state) => state.user);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  useEffect(() => {
    function refresh() {
      setFavoriteIds(getFavoriteIds(user?.id));
    }
    refresh();
    window.addEventListener(FAVORITES_CHANGED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(FAVORITES_CHANGED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [user?.id]);

  const { data: offers, isLoading } = useQuery({
    queryKey: ["offers", "all"],
    queryFn: () => offersApi.list(),
  });

  const favoriteOffers = useMemo(
    () => (offers ?? []).filter((offer) => favoriteIds.includes(offer.id)),
    [offers, favoriteIds]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-yas-midnight">
          Mes favoris
        </h1>
        <p className="text-muted-foreground">
          Retrouvez ici les offres que vous avez sauvegardées pour les
          consulter plus tard.
        </p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Chargement...</p>}

      {!isLoading && favoriteOffers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-yas-sky/10 text-yas-sky">
              <Heart className="size-5" />
            </span>
            <p className="font-medium text-yas-midnight">
              Aucune offre en favoris pour le moment
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Cliquez sur le cœur d&apos;une offre pour la sauvegarder ici et
              la retrouver facilement avant de postuler.
            </p>
            <Button asChild className="mt-2 bg-yas-yellow text-yas-midnight hover:bg-yas-yellow/90">
              <Link href="/offres">Parcourir les offres</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {favoriteOffers.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {favoriteOffers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </div>
  );
}
