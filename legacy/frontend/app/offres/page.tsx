'use client';

import React, { useState, useEffect } from 'react';
import { api, mapOffre, type Job } from '../../lib/api';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, MapPin, Briefcase, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import JobOfferCard from '../../components/JobOfferCard';
import SiteHeader from '../../components/SiteHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function OffersPage() {
  const searchParams = useSearchParams();
  const typeFromQuery = searchParams.get('type');
  const initialType = typeFromQuery === 'CDI' || typeFromQuery === 'CDD' || typeFromQuery === 'Stage' ? typeFromQuery : 'Tous';

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [filterType, setFilterType] = useState(initialType);
  const [filterDepartment, setFilterDepartment] = useState(searchParams.get('location') || 'Tous');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  const loadJobs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiOffres = await api.getOffres();
      const mappedJobs = apiOffres.map(mapOffre);
      setJobs(mappedJobs);
    } catch (err: any) {
      console.error('Erreur lors du chargement des offres:', err);
      setError(err.message || 'Impossible de charger les offres');
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q || job.title.toLowerCase().includes(q) || job.company.toLowerCase().includes(q);
    const matchesType = filterType === 'Tous' || job.type === filterType;
    const matchesDepartment = filterDepartment === 'Tous' || job.department === filterDepartment;
    return matchesSearch && matchesType && matchesDepartment;
  });

  const activeFiltersCount = [
    filterType !== 'Tous',
    filterDepartment !== 'Tous',
  ].filter(Boolean).length;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / ITEMS_PER_PAGE));
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, filterDepartment]);

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
              <ArrowLeft size={16} />
              Retour à l'accueil
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-foreground">
                  {filteredJobs.length} offre{filteredJobs.length > 1 ? 's' : ''} disponible{filteredJobs.length > 1 ? 's' : ''}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {['Tous', 'CDI', 'CDD', 'Stage'].map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={filterType === type ? 'secondary' : 'outline'}
                    onClick={() => setFilterType(type)}
                    className="rounded-2xl px-5 py-2 text-base font-semibold md:h-9"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-8 shadow-sm">
            <div className="flex flex-col gap-3">
              {/* Search row */}
              <div className="relative flex items-center">
                <Search size={18} className="pointer-events-none absolute left-3 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Rechercher un poste, une compétence ou une entreprise"
                  className="h-11 pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* Filters row */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-md bg-white min-w-[160px]">
                  <MapPin size={16} className="text-gray-400" />
                  <select
                    className="outline-none text-gray-900 bg-transparent text-sm"
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                  >
                    <option value="Tous">Tous les départements</option>
                    {Array.from(new Set(jobs.map(j => j.department))).map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {activeFiltersCount > 0 && (
                  <button
                    onClick={() => { setFilterType('Tous'); setFilterDepartment('Tous'); }}
                    className="px-4 py-2.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Réinitialiser les filtres ({activeFiltersCount})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Jobs Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} size="sm"><CardContent className="space-y-3 pt-4"><Skeleton className="h-8 w-8 rounded-lg" /><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-full" /></CardContent></Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
              <Briefcase size={48} className="mx-auto text-red-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-4">{error}</p>
              <Button onClick={loadJobs} variant="secondary">
                Réessayer
              </Button>
            </div>
          ) : paginatedJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedJobs.map((job) => (
                <JobOfferCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border border-gray-200 rounded-lg">
              <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune offre disponible</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {jobs.length === 0 ? 'Aucune offre n\'est disponible pour le moment.' : 'Essayez de modifier vos critères de recherche pour trouver des opportunités correspondantes.'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 text-sm rounded-md font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-secondary text-secondary-foreground'
                      : 'border border-border text-foreground hover:bg-muted'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
