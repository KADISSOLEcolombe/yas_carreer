import { CANDIDATS_A_EVALUER } from '../../../lib/superviseur-data';

const initials = (value: string) => value.charAt(0).toUpperCase();

export default function SuperviseurAEvaluerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">À évaluer</h1>
        <p className="mt-2 text-slate-500">Les candidats qui attendent ton retour.</p>
      </div>

      <div className="grid gap-4">
        {CANDIDATS_A_EVALUER.map((candidate) => (
          <div key={candidate.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1e3a8a] font-bold text-white">
                  {initials(candidate.nom)}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{candidate.nom}</p>
                  <p className="truncate text-sm text-slate-500">{candidate.poste}</p>
                </div>
              </div>
              <button className="rounded-xl bg-[#facc15] px-4 py-2 text-sm font-bold text-[#1e3a8a] transition hover:opacity-90">
                Évaluer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
