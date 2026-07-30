'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin, Building2, Briefcase, Mail, Phone, User } from 'lucide-react';
import { api } from '../../../../lib/api';

const COLORS = {
  yellow: '#FFD100',
  midnight: '#00377D',
};

const EMPTY_FORM = {
  note: '',
  recommandation: 'FAVORABLE' as 'FAVORABLE' | 'DEFAVORABLE',
  rapport: '',
};

export default function SuperviseurEmploiDetailPage() {
  const { id } = useParams();
  const [emploi, setEmploi] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const load = () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    api
      .getEmploiById(Number(id))
      .then(setEmploi)
      .catch((err) => setError(err.message || 'Impossible de charger cette affectation'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const dejaEvalue = Boolean(
    emploi?.evaluations?.some((e: any) => e.utilisateursup_id != null)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emploi) return;
    setIsSubmitting(true);
    setFormError(null);
    try {
      await api.createEvaluation({
        id_emploi: emploi.id,
        note: form.note ? parseFloat(form.note) : undefined,
        fichier_rapport: form.rapport,
        statut: form.recommandation === 'FAVORABLE',
      });
      setSuccess(true);
      setForm(EMPTY_FORM);
      load();
    } catch (err: any) {
      setFormError(err.message || "Erreur lors de l'envoi du rapport");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-[#00377D]" />
      </div>
    );
  }

  if (error || !emploi) {
    return (
      <div className="space-y-4">
        <Link href="/superviseur/a-evaluer" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} /> Retour
        </Link>
        <p className="text-red-600">{error || 'Affectation introuvable'}</p>
      </div>
    );
  }

  const candidat = emploi.candidature?.utilisateur;
  const offre = emploi.candidature?.offre;

  return (
    <div className="space-y-6">
      <Link href="/superviseur/a-evaluer" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft size={16} /> Retour à la liste
      </Link>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Personne suivie</p>
            <h1 className="mt-1 text-2xl font-bold" style={{ color: COLORS.midnight }}>
              {candidat?.prenom} {candidat?.nom}
            </h1>
            <p className="mt-1 text-gray-600">{emploi.sujet}</p>
          </div>
          <span
            className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: '#DBEAFE', color: COLORS.midnight }}
          >
            {emploi.statut || 'EN_COURS'}
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3 text-sm text-gray-700">
            <Briefcase size={18} className="mt-0.5 text-gray-400" />
            <div>
              <p className="font-medium">Offre</p>
              <p>{offre?.titre || '—'} {offre?.type ? `(${offre.type})` : ''}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-sm text-gray-700">
            <Building2 size={18} className="mt-0.5 text-gray-400" />
            <div>
              <p className="font-medium">Département</p>
              <p>{emploi.departement?.nom || '—'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-sm text-gray-700">
            <MapPin size={18} className="mt-0.5 text-gray-400" />
            <div>
              <p className="font-medium">Lieu</p>
              <p>{emploi.lieu || '—'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-sm text-gray-700">
            <Calendar size={18} className="mt-0.5 text-gray-400" />
            <div>
              <p className="font-medium">Période</p>
              <p>
                {emploi.date_debut ? new Date(emploi.date_debut).toLocaleDateString('fr-FR') : '—'}
                {' → '}
                {emploi.date_fin ? new Date(emploi.date_fin).toLocaleDateString('fr-FR') : '—'}
              </p>
            </div>
          </div>
          {candidat?.email && (
            <div className="flex items-start gap-3 text-sm text-gray-700">
              <Mail size={18} className="mt-0.5 text-gray-400" />
              <div>
                <p className="font-medium">E-mail</p>
                <p>{candidat.email}</p>
              </div>
            </div>
          )}
          {candidat?.telephone && (
            <div className="flex items-start gap-3 text-sm text-gray-700">
              <Phone size={18} className="mt-0.5 text-gray-400" />
              <div>
                <p className="font-medium">Téléphone</p>
                <p>{candidat.telephone}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {emploi.evaluations?.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold" style={{ color: COLORS.midnight }}>
            Rapports existants
          </h2>
          <div className="space-y-3">
            {emploi.evaluations.map((ev: any) => (
              <div key={ev.id} className="rounded-xl bg-slate-50 p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {ev.note != null && (
                    <span className="rounded-full bg-[#00377D] px-3 py-1 text-xs font-bold text-white">
                      {ev.note}/20
                    </span>
                  )}
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={
                      ev.statut
                        ? { backgroundColor: '#D1FAE5', color: '#065F46' }
                        : { backgroundColor: '#FEE2E2', color: '#DC2626' }
                    }
                  >
                    {ev.statut ? 'Favorable' : 'Défavorable'}
                  </span>
                </div>
                <p className="whitespace-pre-line text-sm text-slate-700">{ev.fichier_rapport}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!dejaEvalue && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <User size={20} style={{ color: COLORS.midnight }} />
            <h2 className="text-lg font-bold" style={{ color: COLORS.midnight }}>
              Produire le rapport de fin de période
            </h2>
          </div>
          {success && (
            <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Rapport enregistré avec succès.
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">{formError}</div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Note /20</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Recommandation *</label>
                <select
                  required
                  value={form.recommandation}
                  onChange={(e) =>
                    setForm({ ...form, recommandation: e.target.value as 'FAVORABLE' | 'DEFAVORABLE' })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
                >
                  <option value="FAVORABLE">Favorable</option>
                  <option value="DEFAVORABLE">Défavorable</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Rapport *</label>
              <textarea
                required
                rows={7}
                value={form.rapport}
                onChange={(e) => setForm({ ...form, rapport: e.target.value })}
                placeholder="Points forts, axes d'amélioration, appréciation générale..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg px-5 py-2.5 text-sm font-bold text-[#00377D] disabled:opacity-60"
              style={{ backgroundColor: COLORS.yellow }}
            >
              {isSubmitting ? 'Envoi...' : 'Soumettre le rapport'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
