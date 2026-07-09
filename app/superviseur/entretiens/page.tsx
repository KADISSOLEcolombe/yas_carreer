import { MES_ENTRETIENS } from '../../../lib/superviseur-data';

const STATUS_STYLES = {
  Confirmé: { bg: '#D1FAE5', text: '#065F46' },
  'À confirmer': { bg: '#FEF3C7', text: '#92400E' },
} as const;

export default function SuperviseurEntretiensPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Mes entretiens</h1>
        <p className="mt-2 text-slate-500">Entretiens prévus avec les candidats.</p>
      </div>

      <div className="space-y-4">
        {MES_ENTRETIENS.map((interview) => {
          const style = STATUS_STYLES[interview.status];
          return (
            <div key={interview.id} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{interview.nom}</p>
                  <p className="text-sm text-slate-500">{interview.poste}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {interview.date} · {interview.heure}
                  </span>
                  <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: style.bg, color: style.text }}>
                    {interview.status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
