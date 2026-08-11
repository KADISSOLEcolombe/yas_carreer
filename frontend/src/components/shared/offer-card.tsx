import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  CalendarClock,
  GraduationCap,
  MapPin,
  Heart,
} from "lucide-react";
import { OFFER_TYPE_LABELS } from "@/lib/constants";
import {
  daysUntil,
  getDomainLabel,
  inferOfferDomain,
  isOfferExpired,
  splitSkills,
} from "@/lib/offer-utils";
import type { Offer } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { toast } from "sonner";
import { isFavoriteOffer, toggleFavoriteOffer } from "@/lib/favorites";

export function OfferCard({
  offer,
  className,
  showDomain = false,
}: {
  offer: Offer;
  className?: string;
  showDomain?: boolean;
}) {
  const { user } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setIsFavorite(isFavoriteOffer(user?.id, offer.id));
  }, [offer.id, user?.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast("Création de compte requise", {
        description: "Veuillez créer un compte ou vous connecter pour ajouter des offres en favoris.",
        action: {
          label: "Se connecter",
          onClick: () => window.location.href = `/login?next=/offres/${offer.id}`,
        },
      });
      return;
    }

    const nowFavorite = toggleFavoriteOffer(user.id, offer.id);
    setIsFavorite(nowFavorite);
    toast.success(
      nowFavorite ? "Offre ajoutée aux favoris" : "Offre retirée des favoris"
    );
  };

  const skills = splitSkills(offer.requirements).slice(0, 3);
  const days = daysUntil(offer.deadline);
  const expired = isOfferExpired(offer.deadline);
  const domain = showDomain ? inferOfferDomain(offer) : null;
  const excerpt = offer.description
    .split("\n")
    .map((l) => l.trim())
    .filter(
      (l) => l && !/^(à propos|missions|profil|ce que|durée|conditions)/i.test(l)
    )
    .join(" ")
    .slice(0, 130);

  return (
    <Link
      href={`/offres/${offer.id}`}
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-yas-sky/40 hover:shadow-md",
        className
      )}
    >
      {/* Bouton Favoris */}
      <button
        onClick={toggleFavorite}
        className={cn(
          "absolute top-4 right-4 z-10 flex size-9 items-center justify-center rounded-full border border-slate-100 bg-white shadow-sm transition hover:scale-110",
          isFavorite ? "text-red-500 border-red-100" : "text-slate-400 hover:text-slate-600"
        )}
      >
        <Heart className={cn("size-4", isFavorite ? "fill-current" : "")} />
      </button>

      <div className="flex flex-wrap items-center gap-2 pr-8">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
            offer.type === "stage"
              ? "bg-yas-sky/15 text-yas-midnight"
              : "bg-yas-yellow text-yas-midnight"
          )}
        >
          {offer.type === "stage" ? (
            <GraduationCap className="size-3.5" />
          ) : (
            <Briefcase className="size-3.5" />
          )}
          {OFFER_TYPE_LABELS[offer.type]}
        </span>
        {domain && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
            {getDomainLabel(domain)}
          </span>
        )}
        {expired && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
            Offre clôturée
          </span>
        )}
        {!expired && days !== null && days >= 0 && (
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-semibold",
              days <= 14
                ? "bg-amber-50 text-amber-700"
                : "bg-slate-100 text-slate-500"
            )}
          >
            {days === 0 ? "Clôture aujourd'hui" : `${days} j restants`}
          </span>
        )}
      </div>

      <h3 className="mt-3 font-heading text-lg font-semibold leading-snug text-yas-midnight transition group-hover:text-yas-sky">
        {offer.title}
      </h3>

      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-500">
        {excerpt}
        {excerpt.length >= 130 ? "…" : ""}
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
              ? "Clôturée"
              : new Date(offer.deadline).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                })}
          </span>
        )}
      </div>

      {skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <span
              key={skill}
              className="rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200/80"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-yas-midnight opacity-80 transition group-hover:opacity-100">
        Voir l&apos;offre
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
