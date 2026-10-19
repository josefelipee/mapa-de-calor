import { describe, it, expect } from 'vitest';
import { Workbook } from 'exceljs';
import JSZip from 'jszip';
import type { Ocupacao } from '../../types';
import ocupacoesJson from '../../data/ocupacoes.json';
import { buildWorkbook } from './exportWorkbook';
import {
  COLUNAS,
  NUM_FORMATO_DATA,
  NUM_FORMATO_DATAHORA,
  dataHoraParaDate,
  dataParaDate,
  derivadosDeData,
  nomeArquivoExcel,
} from './exportColumns';

const base = ocupacoesJson as Ocupacao[];

const p2 = (n: number) => String(n).padStart(2, '0');
const fmtData = (d: Date) => `${p2(d.getUTCDate())}/${p2(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
const fmtDataHora = (d: Date) => `${fmtData(d)} ${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}`;

// Índices (1-based) das colunas após a inclusão de CANAL e ID_REGISTRO.
const COL_DATA = 14;
const COL_NOVA_COLUNA = 17;
const COL_STATUS_REGISTRO = 18;
const COL_ID_REGISTRO = 19;

async function exportarEReler(registros: Ocupacao[]) {
  const wb = await buildWorkbook(registros);
  const buffer = await wb.xlsx.writeBuffer();
  const wb2 = new Workbook();
  await wb2.xlsx.load(buffer as ArrayBuffer);
  const ws = wb2.getWorksheet('Base');
  if (!ws) throw new Error('Aba Base não encontrada na releitura');
  return { ws, buffer };
}

describe('Exportação Excel — base e estrutura', () => {
  it('contém 7.233 registros e o total de 31/07/2027 = 144,333... (antes de edição)', () => {
    expect(base.length).toBe(7233);
    const total = base
      .filter(o => o.data === '2027-07-31')
      .reduce((s, o) => s + o.novaColunaOrcada, 0);
    expect(total).toBeCloseTo(144.333333, 5);
  });

  it('deriva o nome do arquivo a partir dos anos da base', () => {
    const anos = Array.from(new Set(base.map(o => o.data.slice(0, 4)))).sort();
    const label = anos.length === 1 ? anos[0] : `${anos[0]}-${anos[anos.length - 1]}`;
    const nome = nomeArquivoExcel(base, new Date(2026, 9, 8, 15, 30));
    expect(nome).toBe(`Controles_ION_${label}_atualizado_20261008_1530.xlsx`);
  });
});

describe('Exportação Excel — round-trip', () => {
  it('aba Base com 19 colunas, na ordem correta, e sem perdas/duplicatas', async () => {
    const { ws } = await exportarEReler(base);

    expect(ws.columnCount).toBe(19);

    const headers: string[] = [];
    for (let c = 1; c <= 19; c++) {
      headers.push(String(ws.getRow(1).getCell(c).value));
    }
    expect(headers).toEqual(COLUNAS.map(c => c.header));
    expect(headers[12]).toBe('CANAL');
    expect(headers[17]).toBe('STATUS_REGISTRO');
    expect(headers[18]).toBe('ID_REGISTRO');

    // STATUS_REGISTRO presente e ATIVO quando ausente na base
    expect(String(ws.getCell(2, COL_STATUS_REGISTRO).value)).toBe('ATIVO');

    // ID_REGISTRO = uuid interno do registro
    expect(String(ws.getCell(2, COL_ID_REGISTRO).value)).toBe(base[0].id);

    // linhas = 7233 dados + 1 cabeçalho
    expect(ws.rowCount).toBe(base.length + 1);
    expect(ws.actualRowCount).toBe(base.length + 1);
  });

  it('preserva tipos: DATA e DT_HR como data, numéricos como número', async () => {
    const { ws } = await exportarEReler(base);

    const dados = base[0];
    const r = 2;

    // DATA
    const dataCell = ws.getCell(r, COL_DATA);
    expect(dataCell.value).toBeInstanceOf(Date);
    expect((dataCell.value as Date).toISOString().slice(0, 10)).toBe(dados.data);

    // DT_HR
    const inicio = ws.getCell(r, 1).value as Date;
    const fim = ws.getCell(r, 2).value as Date;
    expect(inicio).toBeInstanceOf(Date);
    expect(fim).toBeInstanceOf(Date);
    expect(fmtDataHora(inicio)).toBe(fmtDataHora(dataHoraParaDate(dados.dtHrInicioRecurso)!));
    expect(fmtDataHora(fim)).toBe(fmtDataHora(dataHoraParaDate(dados.dtHrFimRecurso)!));

    // Semana/Dia numéricos
    expect(typeof ws.getCell(r, 3).value).toBe('number');
    expect(typeof ws.getCell(r, 4).value).toBe('number');

    // Nova Coluna Orçada numérico
    expect(ws.getCell(r, COL_NOVA_COLUNA).value).toBeCloseTo(dados.novaColunaOrcada, 10);

    // ID original preservado
    expect(String(ws.getCell(r, 8).value)).toBe(dados.idPlanilha);
  });

  it('preserva DATA/DT_HR em várias linhas (validação de fuso horário)', async () => {
    const { ws } = await exportarEReler(base);
    const amostra = [1, 2, 100, 500, 1000, 3000, 5000, 7232];
    for (const idx of amostra) {
      const dados = base[idx];
      const r = idx + 2;
      const dataCell = ws.getCell(r, COL_DATA).value as Date;
      expect(dataCell, `idx ${idx} (r=${r}) DATA nula`).toBeInstanceOf(Date);
      expect(fmtData(dataCell)).toBe(fmtData(dataParaDate(dados.data)!));

      const inicio = ws.getCell(r, 1).value as Date;
      expect(inicio, `idx ${idx} (r=${r}) DT_HR nula`).toBeInstanceOf(Date);
      expect(fmtDataHora(inicio)).toBe(fmtDataHora(dataHoraParaDate(dados.dtHrInicioRecurso)!));
    }
  });

  it('exporta a BASE COMPLETA mesmo com janela de edição (ignora filtros visuais)', async () => {
    const { ws } = await exportarEReler(base);
    expect(ws.actualRowCount - 1).toBe(7233);
  });
});

describe('Exportação Excel — edições', () => {
  it('edição de Nova Coluna Orçada aparece no arquivo', async () => {
    const editada = base.map(o => ({ ...o }));
    const alvo = editada.find(o => o.data === '2027-07-31')!;
    alvo.novaColunaOrcada = 999.5;

    const { ws } = await exportarEReler(editada);
    const r = editada.indexOf(alvo) + 2;
    expect(ws.getCell(r, COL_NOVA_COLUNA).value).toBeCloseTo(999.5, 10);
  });

  it('alteração de DATA recalcula Semana/Dia/Mês e mantém o ID', async () => {
    const editada = base.map(o => ({ ...o }));
    const alvo = editada.find(o => o.data === '2027-07-31')!;
    const idOriginal = alvo.idPlanilha;
    const novaData = '2027-08-01';
    alvo.data = novaData;

    const esperados = derivadosDeData(novaData);

    const { ws } = await exportarEReler(editada);
    const r = editada.indexOf(alvo) + 2;

    expect((ws.getCell(r, COL_DATA).value as Date).toISOString().slice(0, 10)).toBe(novaData);
    expect(ws.getCell(r, 3).value).toBe(esperados.semana);
    expect(ws.getCell(r, 4).value).toBe(esperados.dia);
    expect(String(ws.getCell(r, 5).value)).toBe(esperados.mes);
    expect(String(ws.getCell(r, 8).value)).toBe(idOriginal);
  });

  it('exporta CANAL e mantém o ID_REGISTRO interno', async () => {
    const editada = base.map(o => ({ ...o }));
    editada[0] = { ...editada[0], canal: 'CANAL TESTE' };

    const { ws } = await exportarEReler(editada);
    expect(String(ws.getCell(2, 13).value)).toBe('CANAL TESTE');
    expect(String(ws.getCell(2, COL_ID_REGISTRO).value)).toBe(editada[0].id);
  });
});

describe('Exportação Excel — Excel Table e formatos', () => {
  it('cria a Tabela1 (Excel Table) e aplica formatação de data', async () => {
    const wb = await buildWorkbook(base);
    const ws = wb.getWorksheet('Base')!;

    const tabela = ws.getTable('Tabela1');
    expect(tabela).toBeTruthy();
    expect((tabela as { name: string }).name).toBe('Tabela1');

    const buffer = await wb.xlsx.writeBuffer();
    const zip = await JSZip.loadAsync(buffer);
    const tableXml = await zip.file('xl/tables/table1.xml')?.async('string');
    expect(tableXml).toBeTruthy();
    expect(tableXml).toContain('name="Tabela1"');
    expect(tableXml).toContain('displayName="Tabela1"');

    expect(ws.getCell(2, COL_DATA).numFmt).toBe(NUM_FORMATO_DATA);
    expect(ws.getCell(2, 1).numFmt).toBe(NUM_FORMATO_DATAHORA);
  });
});
