import type { Ocupacao } from '../../types';
import { getWeekNumber, getWeekday } from '../../utils/weekNumber';
import { getNomeMes } from '../../utils/dateUtils';

export type TipoColuna = 'texto' | 'numero' | 'data' | 'datahora';

export interface ColunaExport {
  header: string;
  key: keyof Ocupacao | 'derivados';
  width: number;
  tipo: TipoColuna;
}

/** As 16 colunas, na mesma ordem da Tabela1 original. */
export const COLUNAS: ColunaExport[] = [
  { header: 'DT_HR_INICIO_RECURSO', key: 'dtHrInicioRecurso', width: 20, tipo: 'datahora' },
  { header: 'DT_HR_FIM_RECURSO', key: 'dtHrFimRecurso', width: 20, tipo: 'datahora' },
  { header: 'Semana', key: 'derivados', width: 8, tipo: 'numero' },
  { header: 'Dia', key: 'derivados', width: 6, tipo: 'numero' },
  { header: 'Mês', key: 'derivados', width: 6, tipo: 'texto' },
  { header: 'DS_PROJETO_ENGENHARIA_PROJETO_PRODUTO', key: 'projeto', width: 45, tipo: 'texto' },
  { header: 'Tipo', key: 'tipo', width: 20, tipo: 'texto' },
  { header: 'ID', key: 'idPlanilha', width: 18, tipo: 'texto' },
  { header: 'NM_RECURSO', key: 'nmRecurso', width: 20, tipo: 'texto' },
  { header: 'Status', key: 'status', width: 14, tipo: 'texto' },
  { header: 'Tipo2', key: 'tipo2', width: 14, tipo: 'texto' },
  { header: 'SITE', key: 'site', width: 10, tipo: 'texto' },
  { header: 'DATA', key: 'data', width: 12, tipo: 'data' },
  { header: 'Hora2', key: 'hora2', width: 10, tipo: 'numero' },
  { header: 'Hora Orçada', key: 'horaOrcada', width: 12, tipo: 'numero' },
  { header: 'Nova Coluna Orçada', key: 'novaColunaOrcada', width: 18, tipo: 'numero' },
];

export const NUM_FORMATO_DATA = 'dd/mm/yyyy';
export const NUM_FORMATO_DATAHORA = 'dd/mm/yyyy hh:mm';

/** "YYYY-MM-DD" -> Date em 12:00 UTC (evita off-by-one de fuso). */
export function dataParaDate(data: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data);
  if (!m) return null;
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0));
}

/** "YYYY-MM-DDTHH:mm" -> Date em UTC (preserva dia e hora). */
export function dataHoraParaDate(valor: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(valor);
  if (!m) return null;
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]), 0));
}

/** Recalcula Semana/Dia/Mês a partir de DATA, usando as mesmas regras do sistema. */
export function derivadosDeData(data: string) {
  return {
    semana: getWeekNumber(data),
    dia: getWeekday(data),
    mes: getNomeMes(data),
  };
}

export type ValorCelula = string | number | Date | null;

export function buildExportRow(o: Ocupacao): ValorCelula[] {
  const { semana, dia, mes } = derivadosDeData(o.data);
  return [
    dataHoraParaDate(o.dtHrInicioRecurso),
    dataHoraParaDate(o.dtHrFimRecurso),
    semana,
    dia,
    mes,
    o.projeto,
    o.tipo,
    o.idPlanilha,
    o.nmRecurso,
    o.status,
    o.tipo2,
    o.site,
    dataParaDate(o.data),
    o.hora2 ?? null,
    o.horaOrcada ?? null,
    o.novaColunaOrcada,
  ];
}

export function buildExportRows(registros: Ocupacao[]): ValorCelula[][] {
  return registros.map(buildExportRow);
}

/** Nome do arquivo derivado dos anos presentes na base. */
export function nomeArquivoExcel(registros: Ocupacao[], agora: Date = new Date()): string {
  const anos = Array.from(new Set(registros.map(o => o.data.slice(0, 4)))).sort();
  const label =
    anos.length === 0 ? '' : anos.length === 1 ? anos[0] : `${anos[0]}-${anos[anos.length - 1]}`;
  const p = (n: number) => String(n).padStart(2, '0');
  const stamp = `${agora.getFullYear()}${p(agora.getMonth() + 1)}${p(agora.getDate())}_${p(
    agora.getHours()
  )}${p(agora.getMinutes())}`;
  return `Controles_ION_${label}_atualizado_${stamp}.xlsx`;
}
