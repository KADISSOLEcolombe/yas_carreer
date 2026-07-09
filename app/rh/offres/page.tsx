'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, BriefcaseBusiness, Users, ShieldCheck, LayoutGrid } from 'lucide-react';
import { COLORS } from '../../../lib/constants';
import { getJobs, saveJob, updateJob, deleteJob, type Job } from '../../../lib/jobs';

const EMPTY_FORM = {
  title: '',
  company: 'YAS Togo',
  location: 'Lomé',
  type: 'CDI',
  salary: 'À discuter',
  description: '',
  requirements: '',
  responsibilities: '',
};

export default function RHOffresPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadJobs = () => setJobs(getJobs(true));

  useEffect(() => {
    loadJobs();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const openEdit = (job: Job) => {
    setEditingId(job.id);
    setForm({
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      salary: job.salary,
      description: job.description,
      requirements: job.requirements.join('\n'),
      responsibilities: job.responsibilities.join('\n'),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = {
      title: form.title,
      company: form.company,
      location: form.location,
      type: form.type,
      salary: form.salary,
      description: form.description,
      requirements: form.requirements.split('\n').filter(Boolean),
      responsibilities: form.responsibilities.split('\n').filter(Boolean),
      active: true,
    };

    if (editingId) {
      updateJob(editingId, data);
    } else {
      saveJob(data);
    }

    loadJobs();
    setIsSubmitting(false);
  };

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

  return (
    <div className="space-y-10">
      <div className="overflow-hidden rounded-[28px] border bor     der-blue-900/10 bg-white shadow-[0_18px_60px_rgba(0,55,125,0.16)]">
        <div className="grid min-h-[760px] lg:grid-cols-[1.02fr_1fr]">
          <div className="relative overflow-hidden bg-[#3E61B8] px-8 py-10 text-white sm:px-12 lg:px-14">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.10) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
            <div className="relative flex h-full flex-col justify-center">
              <div className="mx-auto mb-10 flex h-28 w-28 items-center justify-center rounded-[32px] bg-[#0D2F88]/80 shadow-xl">
                <div className="text-5xl font-black italic tracking-tight text-[#FFD100]">yas</div>
              </div>
              <div className="mx-auto max-w-md text-center">
                <h2 className="text-4xl font-extrabold leading-tight sm:text-5xl">YAS Togo HR</h2>
                <p className="mt-5 text-lg leading-relaxed text-white/80">
                  Crée et publie une offre en quelques minutes pour attirer les meilleurs talents.
                </p>
                <div className="mt-10 grid grid-cols-1 gap-4 text-left sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                      <BriefcaseBusiness size={20} />
                    </div>
                    <p className="font-semibold">Publication rapide</p>
                    <p className="mt-1 text-sm text-white/75">Renseigne le poste et publie immédiatement.</p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                      <Users size={20} />
                    </div>
                    <p className="font-semibold">Talents ciblés</p>
                    <p className="mt-1 text-sm text-white/75">Description, prérequis et responsabilités bien structurés.</p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                      <ShieldCheck size={20} />
                    </div>
                    <p className="font-semibold">Gestion centralisée</p>
                    <p className="mt-1 text-sm text-white/75">Active, archive ou modifie une offre à tout moment.</p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                      <LayoutGrid size={20} />
                    </div>
                    <p className="font-semibold">Conçu pour RH</p>
                    <p className="mt-1 text-sm text-white/75">Une interface claire, compacte et facile à utiliser.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white px-6 py-8 sm:px-8 lg:px-10">
            <div className="mb-6">
              <h1 className="text-3xl font-extrabold text-slate-900">
                {editingId ? 'Modifier l\'offre' : 'Créer une offre'}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Complète les informations de l’offre avant publication.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Nom du poste *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Développeur Full Stack"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#FFD100] focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Entreprise</label>
                <input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="Ex: YAS Togo"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#FFD100] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Lieu</label>
                  <input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#FFD100] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#FFD100] focus:bg-white"
                  >
                    <option>CDI</option>
                    <option>CDD</option>
                    <option>Stage</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Salaire</label>
                <input
                  value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  placeholder="Ex: 800 000 - 1 200 000 FCFA"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#FFD100] focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Description *</label>
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Décris le poste, le contexte et les missions principales."
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#FFD100] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Prérequis (un par ligne)</label>
                  <textarea
                    rows={5}
                    value={form.requirements}
                    onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                    placeholder="Ex: Maîtrise de React\nEx: Bonne communication"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#FFD100] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Responsabilités (une par ligne)</label>
                  <textarea
                    rows={5}
                    value={form.responsibilities}
                    onChange={(e) => setForm({ ...form, responsibilities: e.target.value })}
                    placeholder="Ex: Concevoir les interfaces\nEx: Collaborer avec l'équipe"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#FFD100] focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={openCreate}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Réinitialiser
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFD100] px-5 py-3 text-sm font-bold text-slate-900 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Plus size={18} />
                  {isSubmitting ? 'Enregistrement...' : editingId ? 'Enregistrer l\'offre' : 'Publier l\'offre'}
                </button>
              </div>
            </form>
          </div>
        </div>
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
                    <td className="px-4 py-3 font-medium text-gray-900">{job.title}</td>
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
                          onClick={() => openEdit(job)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                        >
                          <Pencil size={16} />
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
