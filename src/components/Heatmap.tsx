import { useEffect } from 'react';
import type { SemanaCalculated, DiaCalculated, ViewMode } from '../types';
import { HeatmapCell, type DragCellHandlers } from './HeatmapCell';
import { MESES_ABREV, MESES_EXTENSO } from '../config/heatmapConfig';
import { getWeekStart } from '../utils/weekNumber';
import { parseData, formatISO, addDias } from '../utils/dateUtils';

interface HeatmapProps {
  semanas: SemanaCalculated[];
  onCellClick: (dia: DiaCalculated) => void;
  viewMode: ViewMode;
  semanaSelecionada: number | null;
  drag?: DragCellHandlers;
}

const DIAS_LABEL = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];

interface GrupoMes {
  key: string;
  ano: number;
  mes: number;
  label: string;
  semanas: SemanaCalculated[];
}

function primeiroDia(semana: SemanaCalculated): DiaCalculated | undefined {
  return Array.from(semana.dias.values()).sort((a, b) => a.diaSemana - b.diaSemana)[0];
}

/** Data (YYYY-MM-DD) de uma célula da semana, mesmo quando o dia não tem registro. */
function dataDaCelula(semana: SemanaCalculated, diaSemana: number): string | undefined {
  const primeiro = primeiroDia(semana);
  if (!primeiro) return undefined;
  const segunda = getWeekStart(parseData(primeiro.data));
  return addDias(formatISO(segunda), diaSemana - 1);
}

function agruparPorMes(semanas: SemanaCalculated[]): GrupoMes[] {
  const map = new Map<string, GrupoMes>();
  for (const semana of semanas) {
    const dia = primeiroDia(semana);
    if (!dia) continue;
    const key = `${dia.ano}-${String(dia.mes).padStart(2, '0')}`;
    let grupo = map.get(key);
    if (!grupo) {
      grupo = { key, ano: dia.ano, mes: dia.mes, label: MESES_ABREV[dia.mes - 1], semanas: [] };
      map.set(key, grupo);
    }
    grupo.semanas.push(semana);
  }
  return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
}

export function Heatmap({ semanas, onCellClick, viewMode, semanaSelecionada, drag }: HeatmapProps) {
  useEffect(() => {
    if (semanaSelecionada == null) return;
    const el = document.getElementById(`semana-${semanaSelecionada}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [semanaSelecionada]);

  if (semanas.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        Nenhum dado encontrado para o período/filtro selecionado.
      </div>
    );
  }

  const meses = agruparPorMes(semanas);
  const semestre1 = meses.filter(m => m.mes <= 6);
  const semestre2 = meses.filter(m => m.mes >= 7);
  const detalhada = viewMode === 'detalhada';

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <BlocoSemestre
        meses={semestre1}
        detalhada={detalhada}
        semanaSelecionada={semanaSelecionada}
        onCellClick={onCellClick}
        drag={drag}
      />
      <BlocoSemestre
        meses={semestre2}
        detalhada={detalhada}
        semanaSelecionada={semanaSelecionada}
        onCellClick={onCellClick}
        drag={drag}
      />
    </div>
  );
}

function BlocoSemestre({
  meses,
  detalhada,
  semanaSelecionada,
  onCellClick,
  drag,
}: {
  meses: GrupoMes[];
  detalhada: boolean;
  semanaSelecionada: number | null;
  onCellClick: (dia: DiaCalculated) => void;
  drag?: DragCellHandlers;
}) {
  const ano = meses[0]?.ano;
  const inicioIdx = meses[0] ? meses[0].mes - 1 : 0;
  const fimIdx = meses[meses.length - 1] ? meses[meses.length - 1].mes - 1 : 5;
  const tituloCompleto =
    meses.length === 0
      ? 'Semestre'
      : `${MESES_EXTENSO[inicioIdx].toUpperCase()} – ${MESES_EXTENSO[fimIdx].toUpperCase()} ${ano}`;

  return (
    <section className="flex h-[calc(100vh-12rem)] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
      <header className="z-30 shrink-0 border-b border-gray-100 bg-white px-3 py-2">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-700">{tituloCompleto}</h3>
      </header>

      {meses.length === 0 ? (
        <p className="px-3 py-6 text-center text-xs text-gray-400">Sem dados neste semestre.</p>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto scrollbar-thin">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 top-0 z-30 w-8 border-b border-r border-gray-100 bg-white" />
                <th className="sticky left-8 top-0 z-30 w-9 border-b border-r border-gray-100 bg-white py-1.5 pl-1 text-left text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                  Sem
                </th>
                {DIAS_LABEL.map(d => (
                  <th
                    key={d}
                    className="sticky top-0 z-20 border-b border-gray-100 bg-white py-1.5 text-center text-[9px] font-semibold uppercase tracking-wider text-gray-400"
                  >
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {meses.map(mes =>
                mes.semanas.map((semana, i) => {
                  const selecionada = semanaSelecionada === semana.semana;
                  const atenuada = semanaSelecionada != null && !selecionada;
                  const bgSemana = selecionada ? 'bg-blue-50' : 'bg-white';
                  return (
                    <tr
                      key={`${mes.key}-${semana.semana}`}
                      id={`semana-${semana.semana}`}
                      className={`transition-opacity ${selecionada ? 'bg-blue-50/70' : ''} ${
                        atenuada ? 'opacity-40' : ''
                      }`}
                    >
                      {i === 0 && (
                        <td
                          rowSpan={mes.semanas.length}
                          className="sticky left-0 z-10 w-8 border-b border-r border-gray-100 bg-gray-50 text-center align-middle"
                        >
                          <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
                            {mes.label}
                          </span>
                        </td>
                      )}
                      <td
                        className={`sticky left-8 z-10 w-9 border-b border-r border-gray-50 py-0 pl-1 align-top text-[9px] tabular-nums text-gray-400 ${bgSemana}`}
                      >
                        {semana.semana}
                      </td>
                      {[1, 2, 3, 4, 5, 6, 7].map(diaSemana => (
                        <td key={diaSemana} className="border-b border-gray-50 px-[2px] py-0.5 align-top">
                          <HeatmapCell
                            dia={semana.dias.get(diaSemana)}
                            dataCelula={dataDaCelula(semana, diaSemana)}
                            onClick={onCellClick}
                            detalhada={detalhada}
                            drag={drag}
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
