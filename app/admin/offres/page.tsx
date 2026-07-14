'use client';

import { useState } from 'react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import AdminDashboardHeader from '../../../components/admin/AdminDashboardHeader';
import { getJobs, updateJob, deleteJob, type Job } from '../../../lib/jobs';

const COLORS = {
  midnight: '#1e3a8a',
};

export default function AdminOffresPage() {
  const [jobs, setJobs] = useState<Job[]>(getJobs());

  const handleToggleActive = (job: Job) => {
    const isCurrentlyActive = job.active !== false;
    updateJob(job.id, { active: !isCurrentlyActive });
    setJobs(getJobs());
  };

  const handleDelete = (id: number) => {
    if (confirm('Supprimer cette offre ?')) {
      deleteJob(id);
      setJobs(getJobs());
    }
  };

  return (
    <div className="space-y-6">
      <AdminDashboardHeader />

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <h2 className="text-lg font-bold text-gray-900">Toutes les offres ({jobs.length})</h2>
        </div>

        {jobs.length === 0 ? (
          <p className="text-center text-gray-500 py-12">Aucune offre publiée</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Poste</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Entreprise</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Lieu</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{job.title}</td>
                    <td className="px-4 py-3 text-gray-600">{job.company}</td>
                    <td className="px-4 py-3 text-gray-600">{job.location}</td>
                    <td className="px-4 py-3 text-gray-600">{job.type}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          job.active !== false
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {job.active !== false ? 'Active' : 'Archivée'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleActive(job)}
                          className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
                          title={job.active !== false ? 'Archiver' : 'Réactiver'}
                        >
                          {job.active !== false ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          onClick={() => handleDelete(job.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
