import type { Workbook } from 'exceljs';
import type { Ocupacao } from '../../types';
import { COLUNAS, NUM_FORMATO_DATA, NUM_FORMATO_DATAHORA, buildExportRows } from './exportColumns';

export const NOME_ABA = 'Base';
export const NOME_TABELA = 'Tabela1';

/**
 * Monta o workbook (aba Base + Tabela1) com as 16 colunas.
 * ExcelJS é importado dinamicamente para não inflar o bundle inicial.
 */
export async function buildWorkbook(registros: Ocupacao[]): Promise<Workbook> {
  const ExcelJS = (await import('exceljs')).default;

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Mapa de Calor de Ocupação';

  const ws = wb.addWorksheet(NOME_ABA, {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  const rows = buildExportRows(registros);

  ws.addTable({
    name: NOME_TABELA,
    ref: 'A1',
    headerRow: true,
    totalsRow: false,
    style: { theme: 'TableStyleMedium2', showRowStripes: true },
    columns: COLUNAS.map(c => ({ name: c.header, filterButton: true })),
    rows,
  });

  // Largura das colunas
  COLUNAS.forEach((c, i) => {
    ws.getColumn(i + 1).width = c.width;
  });

  // Formato de datas/números nas linhas de dados (linha 1 = cabeçalho)
  for (let r = 0; r < rows.length; r++) {
    const rowIndex = r + 2;
    COLUNAS.forEach((c, ci) => {
      if (c.tipo === 'data') ws.getCell(rowIndex, ci + 1).numFmt = NUM_FORMATO_DATA;
      else if (c.tipo === 'datahora') ws.getCell(rowIndex, ci + 1).numFmt = NUM_FORMATO_DATAHORA;
    });
  }

  return wb;
}

/** Gera o XLSX e dispara o download no navegador. */
export async function exportarExcel(registros: Ocupacao[], nomeArquivo: string): Promise<void> {
  const wb = await buildWorkbook(registros);
  const buffer = await wb.xlsx.writeBuffer();

  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
