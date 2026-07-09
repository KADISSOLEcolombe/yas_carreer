import { DERNIERES_EVALUATIONS, MES_EVALUATIONS } from '../../../lib/superviseur-data';

const STATUS_STYLES = {
  'Validée': { bg: '#D1FAE5', text: '#065F46' },
  'En attente': { bg: '#FEF3C7', text: '#92400E' },
} as const;

export default function SuperviseurEvaluationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Mes évaluations</h1>
        <p className="mt-2 text-slate-500">Historique de toutes mes évaluations.</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {MES_EVALUATIONS.concat(DERNIERES_EVALUATIONS).map((item) => {
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
    </div>
  );
}
