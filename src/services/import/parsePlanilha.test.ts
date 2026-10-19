import { describe, it, expect } from 'vitest';
import { Workbook } from 'exceljs';
import type { Ocupacao } from '../../types';
import { COLUNAS } from '../export/exportColumns';
import { montarAtualizacoes, parsePlanilha } from './parsePlanilha';

function ocupacao(over: Partial<Ocupacao> & { id: string }): Ocupacao {
  return {
    dtHrInicioRecurso: '2027-05-10T09:00',
    dtHrFimRecurso: '2027-05-10T18:00',
    semana: 0,
    dia: 0,
    mes: '',
    projeto: 'PROJETO X',
    tipo: 'PROGRAMA',
    idPlanilha: '-',
    nmRecurso: '-',
    status: 'Alocação',
    tipo2: '-',
    site: 'ION',
    canal: '',
    data: '2027-05-10',
    hora2: null,
    horaOrcada: null,
    novaColunaOrcada: 5,
    statusRegistro: 'ATIVO',
    ...over,
  } as Ocupacao;
}

function linhaBase(over: Record<string, unknown>): Record<string, unknown> {
  return {
    DT_HR_INICIO_RECURSO: '2027-05-10T09:00',
    DT_HR_FIM_RECURSO: '2027-05-10T18:00',
    Semana: 19,
    Dia: 1,
    'Mês': 'mai',
    DS_PROJETO_ENGENHARIA_PROJETO_PRODUTO: 'PROJETO X',
    Tipo: 'PROGRAMA',
    ID: '-',
    NM_RECURSO: '-',
    Status: 'Alocação',
    Tipo2: '-',
    SITE: 'ION',
    CANAL: '',
    DATA: '2027-05-10',
    Hora2: '-',
    'Hora Orçada': '-',
    'Nova Coluna Orçada': 5,
    STATUS_REGISTRO: 'ATIVO',
    ID_REGISTRO: '',
    ...over,
  };
}

async function gerarXlsx(rows: Record<string, unknown>[]): Promise<ArrayBuffer> {
  const wb = new Workbook();
  const ws = wb.addWorksheet('Base');
  ws.addRow(COLUNAS.map(c => c.header));
  for (const r of rows) {
    ws.addRow(COLUNAS.map(c => r[c.header] ?? null));
  }
  return (await wb.xlsx.writeBuffer()) as ArrayBuffer;
}

describe('parsePlanilha / montarAtualizacoes', () => {
  it('lê o padrão de 19 colunas e casa por ID_REGISTRO', async () => {
    const base: Ocupacao[] = [ocupacao({ id: 'a' }), ocupacao({ id: 'b', canal: 'X', novaColunaOrcada: 3 })];

    const buffer = await gerarXlsx([
      linhaBase({ ID_REGISTRO: 'a', CANAL: 'CANAL A', 'Nova Coluna Orçada': 7 }),
      linhaBase({ ID_REGISTRO: 'b', CANAL: 'X', 'Nova Coluna Orçada': 3 }), // idêntico à base
      linhaBase({ ID_REGISTRO: 'inexistente' }),
      linhaBase({ ID_REGISTRO: '' }), // inválida
    ]);

    const parsed = await parsePlanilha(buffer);
    expect(parsed.erroGeral).toBeUndefined();
    expect(parsed.linhas).toHaveLength(4);

    const merge = montarAtualizacoes(base, parsed.linhas);
    expect(merge.total).toBe(4);
    expect(merge.atualizacoes).toHaveLength(1);
    expect(merge.atualizacoes[0].id).toBe('a');
    expect(merge.atualizacoes[0].canal).toBe('CANAL A');
    expect(merge.atualizacoes[0].novaColunaOrcada).toBe(7);
    expect(merge.inalterados).toBe(1);
    expect(merge.naoEncontrados).toHaveLength(1);
    expect(merge.invalidas).toHaveLength(1);
  });

  it('rejeita planilha fora do padrão', async () => {
    const wb = new Workbook();
    const ws = wb.addWorksheet('Base');
    ws.addRow(['ID_REGISTRO', 'CANAL']);
    ws.addRow(['a', 'X']);
    const buffer = (await wb.xlsx.writeBuffer()) as ArrayBuffer;

    const parsed = await parsePlanilha(buffer);
    expect(parsed.erroGeral).toBeTruthy();
    expect(parsed.linhas).toHaveLength(0);
  });
});
