import type { Ocupacao, DiaCalculated, SemanaCalculated, ConteudoAgregado } from '../types';
import { getWeekNumber, getWeekday } from './weekNumber';
import { getAno, getMes, getNomeMes, parseData } from './dateUtils';
import { CAPACIDADE } from '../config/heatmapConfig';

export function calcularPercentual(valor: number): number {
  return (valor / CAPACIDADE) * 100;
}

export function agruparPorDia(ocupacoes: Ocupacao[]): Map<string, DiaCalculated> {
  const dias = new Map<string, DiaCalculated>();

  for (const o of ocupacoes) {
    let dia = dias.get(o.data);
    if (!dia) {
      dia = {
        data: o.data,
        ano: getAno(o.data),
        mes: getMes(o.data),
        nomeMes: getNomeMes(o.data),
        semana: getWeekNumber(o.data),
        diaSemana: getWeekday(o.data),
        total: 0,
        percentual: 0,
        registros: [],
      };
      dias.set(o.data, dia);
    }
    dia.registros.push(o);
    dia.total += o.novaColunaOrcada;
  }

  for (const dia of dias.values()) {
    dia.percentual = calcularPercentual(dia.total);
  }

  return dias;
}

export function agruparPorSemana(dias: DiaCalculated[]): SemanaCalculated[] {
  const map = new Map<string, SemanaCalculated>();

  for (const dia of dias) {
    const key = `${dia.ano}-${dia.semana}`;
    let semana = map.get(key);
    if (!semana) {
      semana = {
        ano: dia.ano,
        semana: dia.semana,
        total: 0,
        percentual: 0,
        dias: new Map(),
      };
      map.set(key, semana);
    }
    semana.dias.set(dia.diaSemana, dia);
    semana.total += dia.total;
  }

  for (const semana of map.values()) {
    semana.percentual = calcularPercentual(semana.total);
  }

  return Array.from(map.values()).sort((a, b) => {
    if (a.ano !== b.ano) return a.ano - b.ano;
    return a.semana - b.semana;
  });
}

export function agruparConteudosPorDia(dia: DiaCalculated): ConteudoAgregado[] {
  const map = new Map<string, number>();
  for (const r of dia.registros) {
    map.set(r.projeto, (map.get(r.projeto) || 0) + r.novaColunaOrcada);
  }

  return Array.from(map.entries())
    .map(([projeto, total]) => ({
      projeto,
      total,
      percentual: calcularPercentual(total),
    }))
    .sort((a, b) => b.total - a.total);
}

export function getSemanasPorMes(semanas: SemanaCalculated[]): Map<string, SemanaCalculated[]> {
  const map = new Map<string, SemanaCalculated[]>();

  for (const semana of semanas) {
    // Usa o primeiro dia da semana para determinar o mês de exibição
    const primeiroDia = Array.from(semana.dias.values()).sort((a, b) => a.diaSemana - b.diaSemana)[0];
    if (!primeiroDia) continue;

    const key = `${primeiroDia.ano}-${primeiroDia.mes}`;
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(semana);
  }

  return map;
}

/**
 * Retorna todos os números de semana presentes no intervalo [dataInicial, dataFinal],
 * inclusive semanas sem dados (para o gráfico lateral exibir 0%).
 */
export function getSemanasDoIntervalo(dataInicial: string, dataFinal: string): number[] {
  const inicio = parseData(dataInicial);
  const fim = parseData(dataFinal);
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime())) return [];

  const semanas = new Set<number>();
  for (let t = inicio.getTime(); t <= fim.getTime(); t += 86400000) {
    semanas.add(getWeekNumber(new Date(t)));
  }
  return Array.from(semanas).sort((a, b) => a - b);
}
