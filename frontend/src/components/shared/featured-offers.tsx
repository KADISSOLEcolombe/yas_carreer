"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OfferCard } from "@/components/shared/offer-card";
import { offersApi } from "@/lib/api";

export function FeaturedOffers({ limit = 6 }: { limit?: number }) {
  const { data: offers, isLoading, isError } = useQuery({
    queryKey: ["offers", "featured", limit],
    queryFn: () => offersApi.list({}),
  });

  const featured = (offers ?? []).slice(0, limit);

  return (
    <section className="bg-[#F5F7FA] py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-yas-sky">
              Opportunités
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold text-yas-midnight sm:text-4xl">
              Offres en ce moment
            </h2>
            <p className="mt-2 max-w-xl text-slate-500">
              Stages et emplois chez Yas Togo — digital, réseau, vente, RH et plus.
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="h-10 rounded-xl border-slate-200 bg-white"
          >
            <Link href="/offres" className="gap-1.5">
              Toutes les offres
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {isLoading && (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-56 animate-pulse rounded-2xl bg-white"
              />
            ))}
          </div>
        )}

        {isError && (
          <p className="mt-10 rounded-2xl border border-dashed bg-white px-6 py-10 text-center text-sm text-slate-500">
            Impossible de charger les offres pour le moment.
          </p>
        )}

        {!isLoading && !isError && featured.length === 0 && (
          <p className="mt-10 rounded-2xl border border-dashed bg-white px-6 py-10 text-center text-sm text-slate-500">
            Aucune offre publiée pour l&apos;instant.
          </p>
        )}

        {!isLoading && featured.length > 0 && (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
