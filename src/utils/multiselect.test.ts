import { describe, it, expect } from 'vitest';
import {
  atendeSelecao,
  desmarcarTodos,
  filtrarOpcoes,
  rotuloSelecao,
  selecionarTodos,
  toggleSelecao,
  type Selecao,
} from './multiselect';

const TIPOS = ['EVENTO ESPORTIVO', 'PROGRAMA', 'SEM CONTROLE', 'ENTRETENIMENTO'];

const CFG = { todos: 'TODOS', nenhum: 'Nenhum tipo selecionado', contar: (n: number) => `${n} tipos selecionados` };

describe('multiselect (tipos)', () => {
  it('selecionar todos => all (TODOS)', () => {
    const s = selecionarTodos();
    expect(s.selectionMode).toBe('all');
    expect(rotuloSelecao(s, CFG)).toBe('TODOS');
    expect(atendeSelecao('PROGRAMA', s)).toBe(true);
  });

  it('desmarcar todos => nenhum', () => {
    const s = desmarcarTodos();
    expect(s.selectionMode).toBe('custom');
    expect(s.values).toEqual([]);
    expect(rotuloSelecao(s, CFG)).toBe('Nenhum tipo selecionado');
    expect(atendeSelecao('PROGRAMA', s)).toBe(false);
  });

  it('todos menos SEM CONTROLE', () => {
    let s = selecionarTodos();
    s = toggleSelecao(s, 'SEM CONTROLE', TIPOS);
    expect(s.selectionMode).toBe('custom');
    expect(s.values).toEqual(['EVENTO ESPORTIVO', 'PROGRAMA', 'ENTRETENIMENTO']);
    expect(atendeSelecao('SEM CONTROLE', s)).toBe(false);
    expect(atendeSelecao('PROGRAMA', s)).toBe(true);
    expect(rotuloSelecao(s, CFG)).toBe('3 tipos selecionados');
  });

  it('nenhum e depois marcar somente PROGRAMA', () => {
    let s = desmarcarTodos();
    s = toggleSelecao(s, 'PROGRAMA', TIPOS);
    expect(s.values).toEqual(['PROGRAMA']);
    expect(rotuloSelecao(s, CFG)).toBe('PROGRAMA');
    expect(atendeSelecao('EVENTO ESPORTIVO', s)).toBe(false);
    expect(atendeSelecao('PROGRAMA', s)).toBe(true);
  });

  it('marcar todos os disponíveis volta para all', () => {
    let s: Selecao = desmarcarTodos();
    for (const t of TIPOS) s = toggleSelecao(s, t, TIPOS);
    expect(s.selectionMode).toBe('all');
    expect(s.values).toEqual([]);
  });

  it('filtrarOpcoes apenas filtra a lista', () => {
    expect(filtrarOpcoes(TIPOS, 'pro')).toEqual(['PROGRAMA']);
    expect(filtrarOpcoes(TIPOS, '')).toEqual(TIPOS);
  });
});
