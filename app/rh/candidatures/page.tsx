'use client';

import React, { useEffect, useState } from 'react';
import { Eye, Filter } from 'lucide-react';
import { COLORS } from '../../../lib/constants';
import {
  getApplications,
  updateApplicationStatus,
  STATUS_LABELS,
  type Application,
  type ApplicationStatus,
} from '../../../lib/applications';
import { sendNotification } from '../../../lib/notifications';

const STATUS_COLORS: Record<ApplicationStatus, { bg: string; text: string }> = {
  PENDING: { bg: '#FFF7D6', text: '#854D0E' },
  IN_REVIEW: { bg: '#DBEAFE', text: '#1E40AF' },
  INTERVIEW: { bg: '#EDE9FE', text: '#6D28D9' },
  ACCEPTED: { bg: '#D1FAE5', text: '#065F46' },
  REJECTED: { bg: '#FEE2E2', text: '#DC2626' },
};

export default function RHCandidaturesPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filter, setFilter] = useState<ApplicationStatus | 'ALL'>('ALL');
  const [selected, setSelected] = useState<Application | null>(null);

  const load = () => {
    const apps = getApplications().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setApplications(apps);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered =
    filter === 'ALL' ? applications : applications.filter((a) => a.status === filter);

  const handleStatusChange = (app: Application, status: ApplicationStatus) => {
    updateApplicationStatus(app.id, status);
    sendNotification({
      userId: app.userId,
      title: 'Mise à jour de candidature',
      message: `Votre candidature pour « ${app.jobTitle} » est maintenant : ${STATUS_LABELS[status]}.`,
      type: 'STATUS',
    });
    load();
    if (selected?.id === app.id) {
      setSelected({ ...app, status });
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: COLORS.midnight }}>
          Candidatures
        </h1>
        <p className="text-gray-600">Gérer et suivre les candidatures reçues</p>
      </div>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Filter size={16} className="text-gray-400" />
        {(['ALL', 'PENDING', 'IN_REVIEW', 'INTERVIEW', 'ACCEPTED', 'REJECTED'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === s ? 'text-gray-900' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={filter === s ? { backgroundColor: COLORS.yellow } : undefined}
          >
            {s === 'ALL' ? 'Toutes' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-12">Aucune candidature</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Candidat</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Offre</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((app) => {
                  const colors = STATUS_COLORS[app.status];
                  return (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{app.nom}</p>
                        <p className="text-xs text-gray-500">{app.email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{app.jobTitle}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(app.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: colors.bg, color: colors.text }}
                        >
                          {STATUS_LABELS[app.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelected(app)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-md text-xs font-medium"
                        >
                          <Eye size={14} />
                          Détails
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold mb-4" style={{ color: COLORS.midnight }}>
              Détail candidature
            </h2>
            <div className="space-y-3 text-sm mb-6">
              <p><span className="text-gray-500">Candidat :</span> <strong>{selected.nom}</strong></p>
              <p><span className="text-gray-500">Email :</span> {selected.email}</p>
              <p><span className="text-gray-500">Téléphone :</span> {selected.telephone}</p>
              <p><span className="text-gray-500">Offre :</span> {selected.jobTitle}</p>
              <p><span className="text-gray-500">CV :</span> {selected.cvFileName}</p>
              <div>
                <p className="text-gray-500 mb-1">Lettre de motivation :</p>
                <p className="bg-gray-50 border border-gray-200 rounded-md p-3 text-gray-700 whitespace-pre-wrap">
                  {selected.coverLetter}
                </p>
              </div>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modifier le statut
            </label>
            <select
              value={selected.status}
              onChange={(e) => handleStatusChange(selected, e.target.value as ApplicationStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
            >
              {(Object.keys(STATUS_LABELS) as ApplicationStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>

            <button
              onClick={() => setSelected(null)}
              className="w-full py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
