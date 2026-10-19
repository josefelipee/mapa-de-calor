import type { Ocupacao, StatusRegistro } from '../../types';
import { COLUNAS } from '../export/exportColumns';
import { prepararOcupacao } from '../../utils/ocupacao';

export interface LinhaImportada {
  linha: number;
  idRegistro: string;
  campos: Partial<Ocupacao>;
  valida: boolean;
  erro?: string;
}

export interface ResultadoParse {
  headers: string[];
  linhas: LinhaImportada[];
  erroGeral?: string;
}

export interface ResultadoMerge {
  total: number;
  atualizacoes: Ocupacao[];
  naoEncontrados: number[];
  invalidas: { linha: number; erro: string }[];
  inalterados: number;
}

const p2 = (n: number) => String(n).padStart(2, '0');

function cellText(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v.trim();
  if (typeof v === 'number') return String(v);
  if (typeof v === 'object') {
    const o = v as { text?: unknown; richText?: { text: string }[] };
    if (typeof o.text === 'string') return o.text.trim();
    if (Array.isArray(o.richText)) return o.richText.map(r => r.text).join('').trim();
  }
  return String(v).trim();
}

function cellNumber(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const s = cellText(v);
  if (!s || s === '-') return null;
  const n = Number(s.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function dateUTC(v: Date): string {
  return `${v.getUTCFullYear()}-${p2(v.getUTCMonth() + 1)}-${p2(v.getUTCDate())}`;
}

function cellDateISO(v: unknown): string | null {
  if (v instanceof Date) return dateUTC(v);
  const s = cellText(v);
  let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return null;
}

function cellDateTimeISO(v: unknown): string | null {
  if (v instanceof Date) {
    return `${dateUTC(v)}T${p2(v.getUTCHours())}:${p2(v.getUTCMinutes())}`;
  }
  const s = cellText(v);
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(s);
  if (m) return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}`;
  const d = cellDateISO(s);
  return d ? `${d}T00:00` : null;
}

/** Lê o XLSX padrão (19 colunas) e retorna as linhas normalizadas. */
export async function parsePlanilha(buffer: ArrayBuffer): Promise<ResultadoParse> {
  const ExcelJS = (await import('exceljs')).default;
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);

  const ws = wb.getWorksheet('Base') ?? wb.worksheets[0];
  if (!ws) return { headers: [], linhas: [], erroGeral: 'Aba "Base" não encontrada na planilha.' };

  const headerRow = ws.getRow(1).values as unknown[];
  const headers: string[] = [];
  const maxCol = Math.max(ws.columnCount || 0, COLUNAS.length);
  for (let c = 1; c <= maxCol; c++) headers.push(cellText(headerRow[c]));

  const esperados = COLUNAS.map(c => c.header);
  const faltando = esperados.filter(h => !headers.includes(h));
  if (faltando.length > 0) {
    return {
      headers,
      linhas: [],
      erroGeral: `Planilha fora do padrão. Colunas ausentes: ${faltando.join(', ')}.`,
    };
  }

  const colIndex = new Map<string, number>();
  headers.forEach((h, i) => {
    if (h) colIndex.set(h, i + 1);
  });
  const valor = (row: { getCell: (c: number) => { value: unknown } }, header: string): unknown => {
    const c = colIndex.get(header);
    return c ? row.getCell(c).value : null;
  };

  const linhas: LinhaImportada[] = [];
  for (let r = 2; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const idRegistro = cellText(valor(row, 'ID_REGISTRO'));
    const data = cellDateISO(valor(row, 'DATA'));
    const novaColunaOrcada = cellNumber(valor(row, 'Nova Coluna Orçada'));
    const statusRegistroRaw = cellText(valor(row, 'STATUS_REGISTRO')).toUpperCase();

    const campos: Partial<Ocupacao> = {
      dtHrInicioRecurso: cellDateTimeISO(valor(row, 'DT_HR_INICIO_RECURSO')) ?? '',
      dtHrFimRecurso: cellDateTimeISO(valor(row, 'DT_HR_FIM_RECURSO')) ?? '',
      projeto: cellText(valor(row, 'DS_PROJETO_ENGENHARIA_PROJETO_PRODUTO')),
      tipo: cellText(valor(row, 'Tipo')),
      idPlanilha: cellText(valor(row, 'ID')),
      nmRecurso: cellText(valor(row, 'NM_RECURSO')),
      status: cellText(valor(row, 'Status')),
      tipo2: cellText(valor(row, 'Tipo2')),
      site: cellText(valor(row, 'SITE')),
      canal: cellText(valor(row, 'CANAL')),
      data: data ?? '',
      hora2: cellNumber(valor(row, 'Hora2')),
      horaOrcada: cellNumber(valor(row, 'Hora Orçada')),
      novaColunaOrcada: novaColunaOrcada ?? 0,
      statusRegistro: (statusRegistroRaw === 'INATIVO' ? 'INATIVO' : 'ATIVO') as StatusRegistro,
    };

    let erro: string | undefined;
    if (!idRegistro) erro = 'ID_REGISTRO vazio';
    else if (!data) erro = 'DATA inválida';
    else if (novaColunaOrcada === null) erro = 'DURAÇÃO inválida';
    else if (statusRegistroRaw && statusRegistroRaw !== 'ATIVO' && statusRegistroRaw !== 'INATIVO') {
      erro = 'STATUS_REGISTRO inválido';
    }

    // Ignora linhas totalmente vazias.
    if (!idRegistro && !data && !campos.projeto) continue;

    linhas.push({ linha: r, idRegistro, campos, valida: !erro, erro });
  }

  return { headers, linhas };
}

const CAMPOS_COMPARADOS: (keyof Ocupacao)[] = [
  'canal',
  'dtHrInicioRecurso',
  'dtHrFimRecurso',
  'projeto',
  'tipo',
  'idPlanilha',
  'nmRecurso',
  'status',
  'tipo2',
  'site',
  'data',
  'hora2',
  'horaOrcada',
  'novaColunaOrcada',
  'statusRegistro',
];

function iguais(a: Ocupacao, b: Ocupacao): boolean {
  return CAMPOS_COMPARADOS.every(k => JSON.stringify(a[k] ?? null) === JSON.stringify(b[k] ?? null));
}

/** Casa as linhas com a base (por ID_REGISTRO) e monta só o que mudou. */
export function montarAtualizacoes(ocupacoes: Ocupacao[], linhas: LinhaImportada[]): ResultadoMerge {
  const porId = new Map(ocupacoes.map(o => [o.id, o]));
  const atualizacoes: Ocupacao[] = [];
  const naoEncontrados: number[] = [];
  const invalidas: { linha: number; erro: string }[] = [];
  let inalterados = 0;

  for (const l of linhas) {
    if (!l.valida) {
      invalidas.push({ linha: l.linha, erro: l.erro ?? 'linha inválida' });
      continue;
    }
    const atual = porId.get(l.idRegistro);
    if (!atual) {
      naoEncontrados.push(l.linha);
      continue;
    }
    const merged = prepararOcupacao({ ...atual, ...l.campos, id: atual.id });
    if (iguais(atual, merged)) {
      inalterados++;
      continue;
    }
    atualizacoes.push(merged);
  }

  return { total: linhas.length, atualizacoes, naoEncontrados, invalidas, inalterados };
}
