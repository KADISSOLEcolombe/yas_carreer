'use client';

import Link from 'next/link';
import {
  Activity,
  Award,
  Clock3,
  MapPin,
  Rocket,
  Star,
  Target,
  TrendingUp,
  Users,
  ChevronRight,
} from 'lucide-react';
import type { Job } from '../lib/jobs';

interface JobOfferCardProps {
  job: Job;
}

const TYPE_BADGE: Record<string, { bg: string; text: string }> = {
  CDI: { bg: '#003F8C', text: '#FFFFFF' },
  CDD: { bg: '#F6A800', text: '#FFFFFF' },
  Stage: { bg: '#5F99D2', text: '#FFFFFF' },
};

function formatDateFR(value: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(value);
}

function buildPublishedDate(job: Job): Date {
  if (job.createdAt) {
    const created = new Date(job.createdAt);
    if (!Number.isNaN(created.getTime())) {
      return created;
    }
  }

  const seed = new Date('2025-01-01T00:00:00.000Z');
  seed.setDate(seed.getDate() + job.id * 2);
  return seed;
}

function buildClosingDate(job: Job): Date {
  const closeDate = buildPublishedDate(job);
  closeDate.setDate(closeDate.getDate() + 48 + (job.id % 10));
  return closeDate;
}

function getApplicantsCount(job: Job): number {
  return 8 + ((job.id * 9) % 24);
}

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
  const publishedDate = formatDateFR(buildPublishedDate(job));
  const closingDate = formatDateFR(buildClosingDate(job));
  const applicants = getApplicantsCount(job);

  return (
    <article className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-[#003F8C]">
          <Icon size={21} />
        </div>
        <span
          className="inline-flex rounded-full px-3.5 py-1 text-[13px] font-bold leading-none"
          style={{ backgroundColor: typeStyle.bg, color: typeStyle.text }}
        >
          {job.type}
        </span>
      </div>

      <h3 className="mb-1 text-[1.45rem] font-bold leading-tight text-slate-900 md:text-[1.45rem]">
        {job.title}
      </h3>
      <p className="mb-4 text-[1.15rem] text-slate-600 md:text-[1.15rem]">{getCategoryLabel(job)}</p>

      <div className="mb-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[1rem] text-slate-600 md:text-[1rem]">
        <span className="inline-flex items-center gap-1.5">
          <MapPin size={16} /> {job.location}, Togo
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock3 size={16} /> Clôture : {closingDate}
        </span>
      </div>

      <div className="mb-4 inline-flex items-center gap-2 text-[1rem] text-slate-600 md:text-[1rem]">
        <Users size={16} /> {applicants} candidatures
      </div>

      <p className="mb-4 text-[1.6rem] font-extrabold text-[#003F8C] md:text-[1.6rem]">{job.salary || 'À discuter'}</p>

      <div className="flex items-center justify-between border-t border-slate-200 pt-3.5 text-[0.95rem] text-slate-600 md:text-[0.95rem]">
        <span>Publié le {publishedDate}</span>
        <Link
          href={`/offres/${job.id}`}
          className="inline-flex items-center gap-1.5 font-bold text-[#003F8C] hover:opacity-80"
        >
          Voir <ChevronRight size={18} />
        </Link>
      </div>
    </article>
  );
}
