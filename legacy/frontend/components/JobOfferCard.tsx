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
import type { Job } from '@/lib/api';
import { useFavoris } from '@/context/FavorisContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface JobOfferCardProps {
  job: Job;
}

const TYPE_VARIANT: Record<string, string> = {
  CDI: 'bg-yas-midnight text-white',
  CDD: 'bg-[#F6A800] text-white',
  Stage: 'bg-yas-sky text-white',
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
  const Icon = getCardIcon(job);
  const { isFavori, toggleFavori } = useFavoris();
  const favori = isFavori(job.id);

  const handleFavoriClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    toggleFavori(job.id);
  };

  return (
    <Link href={`/offres/${job.id}`} className="group block focus-visible:outline-none">
      <Card
        size="sm"
        className="h-full transition-all duration-200 hover:ring-yas-midnight/40 focus-visible:ring-2 focus-visible:ring-yas-midnight"
      >
        <CardHeader>
          <div className="mb-1 flex items-start justify-between gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-muted text-yas-midnight">
              <Icon size={16} />
            </div>
            <div className="flex items-center gap-1.5">
              <Badge
                className={cn(
                  'rounded-full border-0',
                  TYPE_VARIANT[job.type] || 'bg-slate-500 text-white'
                )}
              >
                {job.type}
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleFavoriClick}
                aria-label={favori ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                aria-pressed={favori}
              >
                <Heart
                  className={favori ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}
                />
              </Button>
            </div>
          </div>
          <CardTitle className="text-[0.95rem] font-bold text-foreground">{job.title}</CardTitle>
          <p className="text-[0.75rem] text-muted-foreground">{getCategoryLabel(job)}</p>
        </CardHeader>

        <CardContent>
          <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.7rem] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} /> {job.location}, Togo
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 size={12} /> Clôture : {job.deadline}
            </span>
          </div>

          {job.candidaturesCount !== undefined && (
            <div className="mb-2 inline-flex items-center gap-1 text-[0.7rem] text-muted-foreground">
              <Users size={12} /> {job.candidaturesCount} candidature
              {job.candidaturesCount !== 1 ? 's' : ''}
            </div>
          )}

          <p className="text-[0.95rem] font-extrabold text-yas-midnight">
            {job.salary || 'À discuter'}
          </p>
        </CardContent>

        <CardFooter className="justify-between text-[0.7rem] text-muted-foreground">
          <span>Publié le {job.postedDate}</span>
          <span className="inline-flex items-center gap-1 font-bold text-yas-midnight transition-colors group-hover:text-secondary">
            Voir <ChevronRight size={14} />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
