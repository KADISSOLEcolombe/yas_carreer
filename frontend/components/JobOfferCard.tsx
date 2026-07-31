'use client';

import Link from 'next/link';
import {
  Activity,
  Award,
  Clock3,
  Heart,
  MapPin,
  Rocket,
  Star,
  Target,
  TrendingUp,
  Users,
  ChevronRight,
} from 'lucide-react';
import type { Job } from '../lib/api';
import { useFavoris } from '../context/FavorisContext';

interface JobOfferCardProps {
  job: Job;
}

const TYPE_BADGE: Record<string, { bg: string; text: string }> = {
  CDI: { bg: '#003F8C', text: '#FFFFFF' },
  CDD: { bg: '#F6A800', text: '#FFFFFF' },
  Stage: { bg: '#5F99D2', text: '#FFFFFF' },
};

function getCategoryLabel(job: Job): string {
  const short = job.category.split('&')[0]?.trim();
  return short && short.length > 0 ? short : 'Technologie';
}

function getCardIcon(job: Job) {
  const key = job.category.toLowerCase();
  if (key.includes('marketing')) return Star;
  if (key.includes('finance')) return TrendingUp;
  if (key.includes('management')) return Target;
  if (key.includes('ressources humaines')) return Award;
  if (key.includes('design')) return Rocket;
  if (key.includes('data')) return Target;
  return Activity;
}

export default function JobOfferCard({ job }: JobOfferCardProps) {
  const typeStyle = TYPE_BADGE[job.type] || { bg: '#64748B', text: '#FFFFFF' };
  const Icon = getCardIcon(job);
  const { isFavori, toggleFavori } = useFavoris();
  const favori = isFavori(job.id);

  const handleFavoriClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    toggleFavori(job.id);
  };

  return (
    <Link
      href={`/offres/${job.id}`}
      className="group block rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all duration-200 hover:border-[#1e3a8a] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a8a] focus-visible:ring-offset-2 cursor-pointer"
    >
      <article>
        <div className="mb-2.5 flex items-start justify-between gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-[#003F8C]">
            <Icon size={16} />
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold leading-none"
              style={{ backgroundColor: typeStyle.bg, color: typeStyle.text }}
            >
              {job.type}
            </span>
            <button
              type="button"
              onClick={handleFavoriClick}
              aria-label={favori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              aria-pressed={favori}
              className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-slate-100"
            >
              <Heart
                size={16}
                className={favori ? 'text-red-500' : 'text-slate-400'}
                fill={favori ? 'currentColor' : 'none'}
              />
            </button>
          </div>
        </div>

        <h3 className="mb-0.5 text-[0.95rem] font-bold leading-tight text-slate-900">
          {job.title}
        </h3>
        <p className="mb-2 text-[0.75rem] text-slate-500">{getCategoryLabel(job)}</p>

        <div className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.7rem] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <MapPin size={12} /> {job.location}, Togo
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock3 size={12} /> Clôture : {job.deadline}
          </span>
        </div>

        {job.candidaturesCount !== undefined && (
          <div className="mb-2 inline-flex items-center gap-1 text-[0.7rem] text-slate-500">
            <Users size={12} /> {job.candidaturesCount} candidature{job.candidaturesCount !== 1 ? 's' : ''}
          </div>
        )}

        <p className="mb-2 text-[0.95rem] font-extrabold text-[#003F8C]">{job.salary || 'À discuter'}</p>

        <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-[0.7rem] text-slate-400">
          <span>Publié le {job.postedDate}</span>
          <span
            className="inline-flex items-center gap-1 font-bold text-[#003F8C] group-hover:text-[#1e3a8a] transition-colors duration-200"
          >
            Voir <ChevronRight size={14} />
          </span>
        </div>
      </article>
    </Link>
  );
}
