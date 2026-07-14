'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, Eye, EyeOff, Plus, X } from 'lucide-react';
import { COLORS } from '../../../lib/constants';
import { getJobs, saveJob, updateJob, deleteJob, type Job, JOB_CATEGORIES, JOB_DEPARTMENTS } from '../../../lib/jobs';

const EMPTY_FORM = {
  title: '',
  company: 'YAS Togo',
  location: 'Lomé',
  department: 'Lomé' as const,
  category: 'Informatique & Tech' as const,
  type: 'CDI',
  salary: 'À discuter',
  description: '',
  requirements: '',
  responsibilities: '',
};

export default function RHOffresPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadJobs = () => setJobs(getJobs(true));

  useEffect(() => {
    loadJobs();
  }, []);

  const handleToggleActive = (job: Job) => {
    const isCurrentlyActive = job.active !== false;
    updateJob(job.id, { active: !isCurrentlyActive });
    loadJobs();
  };

  const handleDelete = (id: number) => {
    if (confirm('Supprimer cette offre ?')) {
      deleteJob(id);
      loadJobs();
    }
  };

  const handleOpenModal = () => {
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = {
      title: form.title,
      company: form.company,
      location: form.location,
      department: form.department,
      category: form.category,
      type: form.type,
      salary: form.salary,
      description: form.description,
      requirements: form.requirements.split('\n').filter(Boolean),
      responsibilities: form.responsibilities.split('\n').filter(Boolean),
      active: true,
    };

    saveJob(data);
    loadJobs();
    setIsSubmitting(false);
    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Offres d'emploi</h1>
          <p className="mt-2 text-sm text-slate-500">
            Gérez toutes les offres d'emploi publiées.
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 rounded-xl bg-[#FFD100] px-5 py-3 text-sm font-bold text-slate-900 transition hover:opacity-95"
        >
          <Plus size={18} />
          Créer une offre
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {jobs.length === 0 ? (
          <p className="text-center text-gray-500 py-12">Aucune offre publiée</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Poste</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Lieu</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/rh/offres/${job.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                        {job.title}
                      </Link>
                    </td>
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

      {/* Modale de création d'offre */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Créer une offre</h2>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Nom du poste *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Développeur Full Stack"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD100] focus:border-transparent"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Entreprise</label>
                <input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="Ex: YAS Togo"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD100] focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Lieu</label>
                  <input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD100] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Département</label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value as any })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD100] focus:border-transparent"
                  >
                    {JOB_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Catégorie</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD100] focus:border-transparent"
                  >
                    {JOB_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD100] focus:border-transparent"
                  >
                    <option>CDI</option>
                    <option>CDD</option>
                    <option>Stage</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Salaire</label>
                <input
                  value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  placeholder="Ex: 800 000 - 1 200 000 FCFA"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD100] focus:border-transparent"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Description *</label>
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Décris le poste, le contexte et les missions principales."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD100] focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Prérequis (un par ligne)</label>
                  <textarea
                    rows={5}
                    value={form.requirements}
                    onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                    placeholder="Ex: Maîtrise de React\nEx: Bonne communication"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD100] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Responsabilités (une par ligne)</label>
                  <textarea
                    rows={5}
                    value={form.responsibilities}
                    onChange={(e) => setForm({ ...form, responsibilities: e.target.value })}
                    placeholder="Ex: Concevoir les interfaces\nEx: Collaborer avec l'équipe"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD100] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-lg bg-[#FFD100] px-4 py-2 text-sm font-bold text-slate-900 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Enregistrement...' : 'Publier l\'offre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
