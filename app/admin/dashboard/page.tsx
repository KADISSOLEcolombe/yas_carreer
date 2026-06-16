'use client';

import React from 'react';
import { Users, Shield, UserX, TrendingUp, Briefcase } from 'lucide-react';
import { COLORS } from '../../../lib/constants';
import Link from 'next/link';

export default function AdminDashboard() {
  const stats = [
    {
      label: 'Total utilisateurs',
      value: '156',
      icon: Users,
      color: 'bg-blue-500',
      trend: '+12%',
    },
    {
      label: 'Rôles actifs',
      value: '3',
      icon: Shield,
      color: 'bg-purple-500',
      trend: '',
    },
    {
      label: 'Comptes désactivés',
      value: '5',
      icon: UserX,
      color: 'bg-red-500',
      trend: '-2',
    },
    {
      label: 'Offres publiées',
      value: '24',
      icon: Briefcase,
      color: 'bg-green-500',
      trend: '+8%',
    },
  ];

  const quickActions = [
    {
      title: 'Gérer les rôles',
      description: 'Créer, modifier et supprimer des rôles utilisateur',
      icon: Shield,
      href: '/admin/roles',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      title: 'Gérer les comptes',
      description: 'Activer, désactiver et gérer les comptes utilisateur',
      icon: Users,
      href: '/admin/accounts',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.midnight }}>
          Tableau de bord Admin
        </h1>
        <p className="text-gray-600">
          Vue d'ensemble de la gestion des utilisateurs et des rôles
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon size={24} className="text-white" />
                </div>
                {stat.trend && (
                  <span className={`text-sm font-medium ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trend}
                  </span>
                )}
              </div>
              <div className="text-3xl font-bold mb-1" style={{ color: COLORS.midnight }}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4" style={{ color: COLORS.midnight }}>
          Actions rapides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className={`bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-all ${action.color}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white bg-opacity-50">
                    <Icon size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{action.title}</h3>
                    <p className="text-sm opacity-80">{action.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4" style={{ color: COLORS.midnight }}>
          Activité récente
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-600">Nouveau rôle créé</span>
            <span className="text-gray-400 ml-auto">Il y a 2 heures</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-gray-600">Compte utilisateur activé</span>
            <span className="text-gray-400 ml-auto">Il y a 5 heures</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-gray-600">Compte utilisateur désactivé</span>
            <span className="text-gray-400 ml-auto">Hier</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-gray-600">Rôle modifié</span>
            <span className="text-gray-400 ml-auto">Il y a 2 jours</span>
          </div>
        </div>
      </div>
    </div>
  );
}
