import { describe, it, expect } from 'vitest';
import type { Ocupacao } from '../types';
import { contarAlocacoesDistintas } from './calculations';

function oc(over: Partial<Ocupacao> & { id: string }): Ocupacao {
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

describe('contarAlocacoesDistintas', () => {
  it('conta 1 para o mesmo início + projeto + site + canal (mesmo em dias diferentes)', () => {
    const registros = [
      oc({ id: 'a', data: '2027-05-10' }),
      oc({ id: 'b', data: '2027-05-11' }), // mesmo início/projeto/site/canal
    ];
    expect(contarAlocacoesDistintas(registros)).toBe(1);
  });

  it('diferencia por SITE e por CANAL', () => {
    expect(
      contarAlocacoesDistintas([oc({ id: 'a', site: 'ION' }), oc({ id: 'b', site: 'GLOBONEWS' })])
    ).toBe(2);
    expect(
      contarAlocacoesDistintas([oc({ id: 'a', canal: 'A' }), oc({ id: 'b', canal: 'B' })])
    ).toBe(2);
  });

  it('diferencia por início e por projeto', () => {
    expect(
      contarAlocacoesDistintas([
        oc({ id: 'a', dtHrInicioRecurso: '2027-05-10T09:00' }),
        oc({ id: 'b', dtHrInicioRecurso: '2027-05-10T10:00' }),
      ])
    ).toBe(2);
    expect(
      contarAlocacoesDistintas([oc({ id: 'a', projeto: 'X' }), oc({ id: 'b', projeto: 'Y' })])
    ).toBe(2);
  });

  it('usa o id quando o início está vazio (não colapsa)', () => {
    expect(
      contarAlocacoesDistintas([
        oc({ id: 'a', dtHrInicioRecurso: '' }),
        oc({ id: 'b', dtHrInicioRecurso: '' }),
      ])
    ).toBe(2);
  });
});
