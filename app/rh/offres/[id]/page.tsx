'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Briefcase, MapPin, Calendar, Users, FileText, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { getJobById, updateJob, deleteJob, type Job } from '../../../../lib/jobs';

const COLORS = {
  midnight: '#1e3a8a',
  yellow: '#facc15',
};

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${COLORS.yellow}33` }}
        >
          <Icon size={20} style={{ color: COLORS.midnight }} aria-hidden="true" />
        </div>
        <h2 className="text-lg font-bold" style={{ color: COLORS.midnight }}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function RequirementBadge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700">
      {text}
    </span>
  );
}

export default function RHOffreDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const offreId = Number(id);

  const job = getJobById(offreId);

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Offre non trouvée</h2>
          <p className="text-gray-600 mb-6">L'offre que vous recherchez n'existe pas.</p>
          <Link
            href="/rh/offres"
            className="inline-flex items-center gap-2 px-6 py-3 font-bold rounded-lg transition-all hover:opacity-90 shadow-sm"
            style={{ backgroundColor: COLORS.yellow, color: COLORS.midnight }}
          >
            <ArrowLeft size={18} />
            Retour aux offres
          </Link>
        </div>
      </div>
    );
  }

  const handleToggleActive = () => {
    const isCurrentlyActive = job.active !== false;
    updateJob(job.id, { active: !isCurrentlyActive });
    router.refresh();
  };

  const handleDelete = () => {
    if (confirm('Supprimer cette offre ?')) {
      deleteJob(job.id);
      router.push('/rh/offres');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Lien retour */}
        <Link
          href="/rh/offres"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Retour aux offres
        </Link>

        {/* En-tête */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Icône */}
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `${COLORS.yellow}33` }}
            >
              <Briefcase size={32} style={{ color: COLORS.midnight }} />
            </div>

            {/* Informations */}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: COLORS.midnight }}>
                {job.title}
              </h1>
              <p className="text-gray-099 mb-4">{job.company}</p>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                    job.active !== false
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {job.active !== false ? 'Active' : 'Archivée'}
                </span>
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                  {job.type}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleToggleActive}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-700 border border-gray-200 bg-white transition-opacity hover:opacity-90"
                title={job.active !== false ? 'Archiver' : 'Réactiver'}
              >
                {job.active !== false ? <EyeOff size={18} /> : <Eye size={18} />}
                {job.active !== false ? 'Archiver' : 'Réactiver'}
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-red-600 border border-red-200 bg-red-50 transition-opacity hover:opacity-90"
              >
                <Trash2 size={18} />
                Supprimer
              </button>
            </div>
          </div>
        </div>

        {/* Informations de l'offre */}
        <SectionCard icon={Briefcase} title="Informations de l'offre">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500 mb-1">Lieu</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  {job.location}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Département</p>
                <p className="font-semibold text-gray-900">{job.department}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500 mb-1">Catégorie</p>
                <p className="font-semibold text-gray-900">{job.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Type de contrat</p>
                <p className="font-semibold text-gray-900">{job.type}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Salaire</p>
              <p className="font-semibold text-gray-900">{job.salary}</p>
            </div>

            {job.createdAt && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Date de publication</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  {new Date(job.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Description */}
        <SectionCard icon={FileText} title="Description">
          <p className="text-gray-700 leading-relaxed">{job.description}</p>
        </SectionCard>

        {/* Prérequis */}
        {job.requirements && job.requirements.length > 0 && (
          <SectionCard icon={Users} title="Prérequis">
            <div className="flex flex-wrap gap-2">
              {job.requirements.map((req, index) => (
                <RequirementBadge key={index} text={req} />
              ))}
            </div>
          </SectionCard>
        )}

        {/* Responsabilités */}
        {job.responsibilities && job.responsibilities.length > 0 && (
          <SectionCard icon={Briefcase} title="Responsabilités">
            <ul className="space-y-2">
              {job.responsibilities.map((resp, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: COLORS.midnight }} />
                  {resp}
                </li>
              ))}
            </ul>
          </SectionCard>
        )}
      </main>
    </div>
  );
}
