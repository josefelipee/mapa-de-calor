import { describe, it, expect } from 'vitest';
import type { Ocupacao } from '../types';
import { normalizarOcupacao, selecionarParaMover, comNovaData } from './ocupacao';

function oc(over: Partial<Ocupacao> & { id: string }): Ocupacao {
  return {
    dtHrInicioRecurso: '2027-03-11T08:00',
    dtHrFimRecurso: '2027-03-11T18:00',
    semana: 11,
    dia: 4,
    mes: 'mar',
    projeto: 'FÓRMULA 1',
    tipo: 'EVENTO ESPORTIVO',
    idPlanilha: 'Controle ION_ION',
    nmRecurso: 'Controles_ION_2026',
    status: 'Alocação',
    tipo2: 'Ciclo',
    site: 'ION',
    data: '2027-03-11',
    hora2: 2,
    horaOrcada: 2,
    novaColunaOrcada: 2,
    ...over,
  } as Ocupacao;
}

describe('normalizarOcupacao', () => {
  it('base antiga sem statusRegistro vira ATIVO', () => {
    const semCampo = oc({ id: 'a' });
    delete (semCampo as unknown as Record<string, unknown>).statusRegistro;
    expect(normalizarOcupacao(semCampo).statusRegistro).toBe('ATIVO');
  });

  it('preserva INATIVO e ATIVO', () => {
    expect(normalizarOcupacao(oc({ id: 'a', statusRegistro: 'INATIVO' })).statusRegistro).toBe('INATIVO');
    expect(normalizarOcupacao(oc({ id: 'b', statusRegistro: 'ATIVO' })).statusRegistro).toBe('ATIVO');
  });
});

describe('selecionarParaMover', () => {
  const base: Ocupacao[] = [
    oc({ id: '1', data: '2027-03-11', tipo: 'EVENTO ESPORTIVO', statusRegistro: 'ATIVO' }),
    oc({ id: '2', data: '2027-03-11', tipo: 'EVENTO ESPORTIVO', statusRegistro: 'ATIVO' }),
    oc({ id: '3', data: '2027-03-11', tipo: 'EVENTO ESPORTIVO', statusRegistro: 'INATIVO' }),
    oc({ id: '4', data: '2027-03-11', tipo: 'PROGRAMA', statusRegistro: 'ATIVO' }),
    oc({ id: '5', data: '2027-03-12', tipo: 'EVENTO ESPORTIVO', statusRegistro: 'ATIVO' }),
    oc({ id: '6', projeto: 'WSL', data: '2027-03-11', statusRegistro: 'ATIVO' }),
  ];

  it('filtro ATIVO move só ativos do projeto/tipo/data', () => {
    const r = selecionarParaMover(base, {
      dataOrigem: '2027-03-11',
      projeto: 'FÓRMULA 1',
      tipos: { selectionMode: 'custom', values: ['EVENTO ESPORTIVO'] },
      statusRegistro: 'ATIVO',
    });
    expect(r.map(o => o.id)).toEqual(['1', '2']);
  });

  it('filtro INATIVO move só inativos', () => {
    const r = selecionarParaMover(base, {
      dataOrigem: '2027-03-11',
      projeto: 'FÓRMULA 1',
      tipos: { selectionMode: 'custom', values: ['EVENTO ESPORTIVO'] },
      statusRegistro: 'INATIVO',
    });
    expect(r.map(o => o.id)).toEqual(['3']);
  });

  it('filtro TODOS (tipos e status) move ativos e inativos do projeto/data', () => {
    const r = selecionarParaMover(base, {
      dataOrigem: '2027-03-11',
      projeto: 'FÓRMULA 1',
      tipos: { selectionMode: 'all', values: [] },
      statusRegistro: 'TODOS',
    });
    expect(r.map(o => o.id)).toEqual(['1', '2', '3', '4']);
  });
});

describe('comNovaData', () => {
  it('altera somente a DATA, preservando os demais campos', () => {
    const original = oc({ id: 'x', data: '2027-03-11', statusRegistro: 'ATIVO' });
    const [movido] = comNovaData([original], '2027-03-14');
    expect(movido.data).toBe('2027-03-14');
    expect(movido.dtHrInicioRecurso).toBe(original.dtHrInicioRecurso);
    expect(movido.dtHrFimRecurso).toBe(original.dtHrFimRecurso);
    expect(movido.projeto).toBe(original.projeto);
    expect(movido.tipo).toBe(original.tipo);
    expect(movido.statusRegistro).toBe(original.statusRegistro);
    expect(movido.novaColunaOrcada).toBe(original.novaColunaOrcada);
    expect(movido.id).toBe(original.id);
  });
});
