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
import type { Job } from '../lib/api';

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
    <Link
      href={`/offres/${job.id}`}
      className="group block rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all duration-200 hover:border-[#1e3a8a] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a8a] focus-visible:ring-offset-2 cursor-pointer"
    >
      <article>
        <div className="mb-2.5 flex items-start justify-between gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-[#003F8C]">
            <Icon size={16} />
          </div>
          <span
            className="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold leading-none"
            style={{ backgroundColor: typeStyle.bg, color: typeStyle.text }}
          >
            {job.type}
          </span>
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
            <Clock3 size={12} /> Clôture : {closingDate}
          </span>
        </div>

        <div className="mb-2 inline-flex items-center gap-1 text-[0.7rem] text-slate-500">
          <Users size={12} /> {applicants} candidatures
        </div>

        <p className="mb-2 text-[0.95rem] font-extrabold text-[#003F8C]">{job.salary || 'À discuter'}</p>

        <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-[0.7rem] text-slate-400">
          <span>Publié le {publishedDate}</span>
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
