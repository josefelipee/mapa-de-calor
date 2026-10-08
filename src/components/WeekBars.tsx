import type { SemanaCalculated } from '../types';
import { getCorRelativa } from '../config/heatmapConfig';

interface WeekBarsProps {
  semanasNoIntervalo: number[];
  semanas: SemanaCalculated[];
  semanaSelecionada: number | null;
  onSemanaClick: (semana: number) => void;
}

export function WeekBars({
  semanasNoIntervalo,
  semanas,
  semanaSelecionada,
  onSemanaClick,
}: WeekBarsProps) {
  const percentualPorSemana = new Map<number, number>();
  for (const s of semanas) {
    percentualPorSemana.set(s.semana, s.percentual);
  }

  const valores = semanasNoIntervalo
    .map(w => percentualPorSemana.get(w) ?? 0)
    .filter(v => v > 0);

  const min = valores.length ? Math.min(...valores) : 0;
  const max = valores.length ? Math.max(...valores) : 0;
  const media = valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : 0;
  const maxBarra = Math.max(100, max);

  return (
    <aside className="sticky top-3 hidden h-[calc(100vh-12rem)] w-60 shrink-0 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white lg:flex">
      <div className="border-b border-gray-100 px-3 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Total semana por</p>
        <p className="text-[11px] font-bold uppercase tracking-wide text-gray-700">Semana do ano</p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin">
        {semanasNoIntervalo.map(semana => {
          const percentual = percentualPorSemana.get(semana) ?? 0;
          const cor = percentual > 0 ? getCorRelativa(percentual, min, media, max) : undefined;
          const largura = percentual > 0 ? Math.max(3, (percentual / maxBarra) * 100) : 0;
          const selecionada = semanaSelecionada === semana;

          return (
            <button
              key={semana}
              onClick={() => onSemanaClick(semana)}
              className={`flex w-full items-center gap-2 rounded-sm px-1 py-[3px] transition ${
                selecionada ? 'bg-blue-50 ring-1 ring-blue-300' : 'hover:bg-gray-50'
              }`}
            >
              <span
                className={`w-5 shrink-0 text-right text-[10px] tabular-nums ${
                  selecionada ? 'font-bold text-blue-700' : 'text-gray-400'
                }`}
              >
                {semana}
              </span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-sm bg-gray-100">
                {largura > 0 && (
                  <div className="h-full rounded-sm" style={{ width: `${largura}%`, backgroundColor: cor }} />
                )}
              </div>
              <span
                className={`w-9 shrink-0 text-right text-[10px] tabular-nums ${
                  selecionada ? 'font-bold text-blue-700' : 'text-gray-600'
                }`}
              >
                {Math.round(percentual)}%
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
