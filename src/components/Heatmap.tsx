import type { SemanaCalculated, DiaCalculated } from '../types';
import { HeatmapCell } from './HeatmapCell';
import { MESES_ABREV, MESES_EXTENSO } from '../config/heatmapConfig';

interface HeatmapProps {
  semanas: SemanaCalculated[];
  onCellClick: (dia: DiaCalculated) => void;
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

export function Heatmap({ semanas, onCellClick }: HeatmapProps) {
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

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <BlocoSemestre titulo="JANEIRO – JUNHO" meses={semestre1} onCellClick={onCellClick} />
      <BlocoSemestre titulo="JULHO – DEZEMBRO" meses={semestre2} onCellClick={onCellClick} />
    </div>
  );
}

function BlocoSemestre({
  titulo,
  meses,
  onCellClick,
}: {
  titulo: string;
  meses: GrupoMes[];
  onCellClick: (dia: DiaCalculated) => void;
}) {
  const ano = meses[0]?.ano;
  const inicioIdx = meses[0] ? meses[0].mes - 1 : 0;
  const fimIdx = meses[meses.length - 1] ? meses[meses.length - 1].mes - 1 : 5;
  const tituloCompleto =
    meses.length === 0
      ? titulo
      : `${MESES_EXTENSO[inicioIdx].toUpperCase()} – ${MESES_EXTENSO[fimIdx].toUpperCase()} ${ano}`;

  return (
    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <header className="border-b border-gray-100 px-3 py-2">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-700">{tituloCompleto}</h3>
      </header>

      {meses.length === 0 ? (
        <p className="px-3 py-6 text-center text-xs text-gray-400">Sem dados neste semestre.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="w-8" />
              <th className="w-9 py-1.5 text-left text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                Sem
              </th>
              {DIAS_LABEL.map(d => (
                <th
                  key={d}
                  className="py-1.5 text-center text-[9px] font-semibold uppercase tracking-wider text-gray-400"
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {meses.map(mes =>
              mes.semanas.map((semana, i) => (
                <tr key={`${mes.key}-${semana.semana}`} className="border-b border-gray-50 last:border-0">
                  {i === 0 && (
                    <td
                      rowSpan={mes.semanas.length}
                      className="w-8 border-r border-gray-100 bg-gray-50/70 text-center align-middle"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
                        {mes.label}
                      </span>
                    </td>
                  )}
                  <td className="w-9 py-0.5 pl-1 pr-1 text-[10px] tabular-nums text-gray-400">
                    {semana.semana}
                  </td>
                  {[1, 2, 3, 4, 5, 6, 7].map(diaSemana => (
                    <td key={diaSemana} className="px-[2px] py-0.5">
                      <HeatmapCell dia={semana.dias.get(diaSemana)} onClick={onCellClick} />
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </section>
  );
}
