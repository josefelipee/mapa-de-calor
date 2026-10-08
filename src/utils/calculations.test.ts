import { describe, it, expect } from 'vitest';
import type { DiaCalculated } from '../types';
import { calcularMetricasSemanais } from './calculations';

function dia(data: string, percentual: number): DiaCalculated {
  const [ano, mes] = data.split('-').map(Number);
  return {
    data,
    ano,
    mes,
    nomeMes: '',
    semana: 0,
    diaSemana: 0,
    total: 0,
    percentual,
    registros: [],
  };
}

function mapa(dias: DiaCalculated[]): Map<string, DiaCalculated> {
  return new Map(dias.map(d => [d.data, d]));
}

describe('calcularMetricasSemanais', () => {
  // Semana 31/2027: seg 26/07 a dom 01/08 (exemplo do requisito)
  const semana31 = mapa([
    dia('2027-07-26', 50),
    dia('2027-07-27', 60),
    dia('2027-07-28', 80),
    dia('2027-07-29', 40),
    dia('2027-07-30', 100),
    dia('2027-07-31', 120),
    dia('2027-08-01', 70),
  ]);

  it('total = soma dos percentuais diários (520%)', () => {
    const r = calcularMetricasSemanais(semana31, '2027-07-26', '2027-08-01');
    expect(r).toHaveLength(1);
    expect(r[0].semana).toBe(31);
    expect(r[0].total).toBe(520);
  });

  it('media = média dos percentuais diários (74,29%)', () => {
    const r = calcularMetricasSemanais(semana31, '2027-07-26', '2027-08-01');
    expect(r[0].media).toBeCloseTo(520 / 7, 6);
    expect(Math.round(r[0].media)).toBe(74);
  });

  it('pico = maior percentual diário (120%) e sua data', () => {
    const r = calcularMetricasSemanais(semana31, '2027-07-26', '2027-08-01');
    expect(r[0].pico).toBe(120);
    expect(r[0].picoData).toBe('2027-07-31');
  });

  it('dias dentro do período sem alocação contam como 0% na média', () => {
    // Só dois dias com dados; os outros 5 dias da semana contam como 0%
    const parcial = mapa([dia('2027-07-26', 50), dia('2027-07-28', 100)]);
    const r = calcularMetricasSemanais(parcial, '2027-07-26', '2027-08-01');
    expect(r[0].total).toBe(150);
    expect(r[0].media).toBeCloseTo(150 / 7, 6);
    expect(r[0].pico).toBe(100);
    expect(r[0].picoData).toBe('2027-07-28');
  });

  it('ignora dias fora do filtro de Data Inicial/Final', () => {
    // Período restrito a 27/07..29/07 => 3 dias considerados
    const r = calcularMetricasSemanais(semana31, '2027-07-27', '2027-07-29');
    expect(r[0].total).toBe(60 + 80 + 40);
    expect(r[0].media).toBeCloseTo((60 + 80 + 40) / 3, 6);
    expect(r[0].pico).toBe(80);
  });

  it('retorna semanas ordenadas e com 0 quando não há dados', () => {
    const vazio = mapa([]);
    const r = calcularMetricasSemanais(vazio, '2027-07-26', '2027-08-08');
    expect(r.map(x => x.semana)).toEqual([31, 32]);
    expect(r[0].total).toBe(0);
    expect(r[1].total).toBe(0);
  });
});
