'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Users, Calendar, CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react';
import { COLORS } from '../../../lib/constants';
import { getJobs } from '../../../lib/jobs';
import { getApplicationStats, getApplications } from '../../../lib/applications';
import { getUpcomingInterviews } from '../../../lib/interviews';
import { getNotifications } from '../../../lib/notifications';

export default function RHDashboardPage() {
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    upcomingInterviews: 0,
    notificationsSent: 0,
  });
  const [recentApps, setRecentApps] = useState<ReturnType<typeof getApplications>>([]);

  useEffect(() => {
    const appStats = getApplicationStats();
    const jobs = getJobs();
    const interviews = getUpcomingInterviews();
    const notifs = getNotifications();

    setStats({
      activeJobs: jobs.length,
      totalApplications: appStats.total,
      pending: appStats.pending + appStats.inReview,
      accepted: appStats.accepted,
      rejected: appStats.rejected,
      upcomingInterviews: interviews.length,
      notificationsSent: notifs.length,
    });

    setRecentApps(
      getApplications()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
    );
  }, []);

  const cards = [
    { label: 'Offres actives', value: stats.activeJobs, icon: Briefcase, color: COLORS.midnight, href: '/rh/offres' },
    { label: 'Candidatures', value: stats.totalApplications, icon: Users, color: '#5F99D2', href: '/rh/candidatures' },
    { label: 'En attente', value: stats.pending, icon: Clock, color: '#854D0E', href: '/rh/candidatures' },
    { label: 'Entretiens à venir', value: stats.upcomingInterviews, icon: Calendar, color: '#7C3AED', href: '/rh/entretiens' },
    { label: 'Acceptées', value: stats.accepted, icon: CheckCircle, color: '#065F46', href: '/rh/candidatures' },
    { label: 'Refusées', value: stats.rejected, icon: XCircle, color: '#DC2626', href: '/rh/candidatures' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: COLORS.midnight }}>
          Tableau de bord
        </h1>
        <p className="text-gray-600">Vue d'ensemble du recrutement YAS Togo</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-md bg-gray-50">
                  <Icon size={20} style={{ color: card.color }} />
                </div>
                <TrendingUp size={16} className="text-gray-300" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{card.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: COLORS.midnight }}>
            Dernières candidatures
          </h2>
          <Link href="/rh/candidatures" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
            Voir tout
          </Link>
        </div>

        {recentApps.length === 0 ? (
          <p className="text-gray-500 text-sm py-8 text-center">Aucune candidature pour le moment</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentApps.map((app) => (
              <div key={app.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{app.nom}</p>
                  <p className="text-sm text-gray-500 truncate">{app.jobTitle}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(app.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
