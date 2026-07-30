import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  CalendarClock,
  GraduationCap,
  MapPin,
} from "lucide-react";
import { OFFER_TYPE_LABELS } from "@/lib/constants";
import {
  daysUntil,
  getDomainLabel,
  inferOfferDomain,
  splitSkills,
} from "@/lib/offer-utils";
import type { Offer } from "@/lib/types";
import { cn } from "@/lib/utils";

export function OfferCard({
  offer,
  className,
  showDomain = false,
}: {
  offer: Offer;
  className?: string;
  showDomain?: boolean;
}) {
  const skills = splitSkills(offer.requirements).slice(0, 3);
  const days = daysUntil(offer.deadline);
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
        "group flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-yas-sky/40 hover:shadow-md",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
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
        {days !== null && days >= 0 && days <= 14 && (
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
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
            {new Date(offer.deadline).toLocaleDateString("fr-FR", {
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
