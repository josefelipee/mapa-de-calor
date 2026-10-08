import type { SemanaCalculated } from '../types';
import { getFaixa } from '../config/heatmapConfig';

interface WeekBarsProps {
  semanasNoIntervalo: number[];
  semanas: SemanaCalculated[];
}

export function WeekBars({ semanasNoIntervalo, semanas }: WeekBarsProps) {
  const percentualPorSemana = new Map<number, number>();
  for (const s of semanas) {
    percentualPorSemana.set(s.semana, s.percentual);
  }

  const maximo = Math.max(100, ...semanasNoIntervalo.map(w => percentualPorSemana.get(w) ?? 0));

  return (
    <aside className="sticky top-3 hidden h-[calc(100vh-6rem)] w-60 shrink-0 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white lg:flex">
      <div className="border-b border-gray-100 px-3 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Total semana por</p>
        <p className="text-[11px] font-bold uppercase tracking-wide text-gray-700">Semana do ano</p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin">
        {semanasNoIntervalo.map(semana => {
          const percentual = percentualPorSemana.get(semana) ?? 0;
          const faixa = getFaixa(percentual);
          const largura = percentual > 0 ? Math.max(3, (percentual / maximo) * 100) : 0;

          return (
            <div key={semana} className="flex items-center gap-2 py-[3px]">
              <span className="w-5 shrink-0 text-right text-[10px] tabular-nums text-gray-400">{semana}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-sm bg-gray-100">
                {largura > 0 && (
                  <div className={`h-full rounded-sm ${faixa.bg}`} style={{ width: `${largura}%` }} />
                )}
              </div>
              <span className="w-9 shrink-0 text-right text-[10px] tabular-nums text-gray-600">
                {Math.round(percentual)}%
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
