import Link from 'next/link';
import { CANDIDATS_A_EVALUER, DERNIERES_EVALUATIONS } from '../../../lib/superviseur-data';

const STATUS_STYLES = {
  'Validée': { bg: '#D1FAE5', text: '#065F46' },
  'En attente': { bg: '#FEF3C7', text: '#92400E' },
} as const;

const initials = (value: string) => value.charAt(0).toUpperCase();

export default function SuperviseurDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-[#1e3a8a] px-6 py-8 text-white shadow-sm sm:px-8">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#facc15] text-2xl font-black text-[#1e3a8a] shadow-lg">
            S
          </div>
          <div>
            <p className="text-2xl font-extrabold sm:text-3xl">Bonjour, Superviseur 👋</p>
            <p className="mt-2 text-sm text-white/80">Espace Superviseur · YAS TOGO</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Candidats à évaluer</h2>
              <p className="text-sm text-slate-500">Liste des profils en attente de ton retour</p>
            </div>
            <Link href="/superviseur/a-evaluer" className="text-sm font-semibold text-[#1e3a8a] hover:underline">
              Voir tout
            </Link>
          </div>

          <div className="space-y-4">
            {CANDIDATS_A_EVALUER.map((candidate) => (
              <div key={candidate.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1e3a8a] text-sm font-bold text-white">
                    {initials(candidate.nom)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{candidate.nom}</p>
                    <p className="truncate text-sm text-slate-500">{candidate.poste}</p>
                  </div>
                </div>
                <button className="shrink-0 rounded-xl bg-[#facc15] px-4 py-2 text-sm font-bold text-[#1e3a8a] transition hover:opacity-90">
                  Évaluer
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Mes dernières évaluations</h2>
              <p className="text-sm text-slate-500">Historique récent de mes retours</p>
            </div>
            <Link href="/superviseur/evaluations" className="text-sm font-semibold text-[#1e3a8a] hover:underline">
              Voir tout
            </Link>
          </div>

          <div className="space-y-4">
            {DERNIERES_EVALUATIONS.map((item) => {
              const statusStyle = STATUS_STYLES[item.status];
              return (
                <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{item.nom}</p>
                      <p className="truncate text-sm text-slate-500">{item.poste}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex rounded-full bg-[#1e3a8a] px-3 py-1 text-xs font-bold text-white">
                        {item.note}
                      </span>
                      <span
                        className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                        style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                      >
                        {item.status}
                      </span>
                      <span className="text-xs text-slate-500">{item.date}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
