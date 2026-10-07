import type { SemanaCalculated, DiaCalculated } from '../types';
import { HeatmapCell, DIAS_LABEL } from './HeatmapCell';
import { formatMesAno } from '../utils/dateUtils';

interface HeatmapProps {
  semanas: SemanaCalculated[];
  onCellClick: (dia: DiaCalculated) => void;
}

export function Heatmap({ semanas, onCellClick }: HeatmapProps) {
  if (semanas.length === 0) {
    return (
      <div className="rounded-lg bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
        Nenhum dado encontrado para o período/filtro selecionado.
      </div>
    );
  }

  // Agrupa semanas por mês do primeiro dia da semana
  const grupos = new Map<string, SemanaCalculated[]>();
  for (const semana of semanas) {
    const diasOrdenados = Array.from(semana.dias.values()).sort((a, b) => a.diaSemana - b.diaSemana);
    const primeiro = diasOrdenados[0];
    const key = `${primeiro.ano}-${primeiro.mes}`;
    if (!grupos.has(key)) grupos.set(key, []);
    grupos.get(key)!.push(semana);
  }

  const gruposOrdenados = Array.from(grupos.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="space-y-6">
      {gruposOrdenados.map(([key, semanasMes]) => {
        const primeiroDia = Array.from(semanasMes[0].dias.values()).sort((a, b) => a.diaSemana - b.diaSemana)[0];
        return (
          <div key={key} className="rounded-lg bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-700">
              {formatMesAno(primeiroDia.data)}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="w-24 py-2 pr-2 text-left text-xs font-semibold text-gray-500">Semana</th>
                    {DIAS_LABEL.slice(1).map(dia => (
                      <th key={dia} className="py-2 text-center text-xs font-semibold text-gray-500">
                        {dia}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="space-y-1">
                  {semanasMes.map(semana => (
                    <tr key={`${semana.ano}-${semana.semana}`} className="border-t border-gray-100">
                      <td className="py-2 pr-2 text-xs font-medium text-gray-600">
                        Semana {semana.semana}
                      </td>
                      {[1, 2, 3, 4, 5, 6, 7].map(diaSemana => (
                        <td key={diaSemana} className="px-0.5 py-1">
                          <HeatmapCell
                            dia={semana.dias.get(diaSemana)}
                            onClick={onCellClick}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
