import { describe, it, expect } from 'vitest';
import {
  desmarcarTodos,
  filtrarProjetos,
  rotuloSelecao,
  selecionarTodos,
  toggleProjeto,
  type ProjectSelection,
} from './projectSelection';

const OPTIONS = ['AFROPUNK BAHIA', 'SPORTV NEWS', 'WSL', 'REDAÇÃO SPORTV', 'COPA DO MUNDO'];

describe('projectSelection', () => {
  it('selecionar todos => all', () => {
    const s = selecionarTodos();
    expect(s.selectionMode).toBe('all');
    expect(rotuloSelecao(s)).toBe('Todos os projetos');
  });

  it('desmarcar todos => custom com zero selecionados', () => {
    const s = desmarcarTodos();
    expect(s.selectionMode).toBe('custom');
    expect(s.selectedProjects).toEqual([]);
    expect(rotuloSelecao(s)).toBe('Nenhum projeto selecionado');
  });

  it('marcar somente AFROPUNK BAHIA a partir de nenhum', () => {
    let s: ProjectSelection = desmarcarTodos();
    s = toggleProjeto(s, 'AFROPUNK BAHIA', OPTIONS);
    expect(s.selectionMode).toBe('custom');
    expect(s.selectedProjects).toEqual(['AFROPUNK BAHIA']);
    expect(rotuloSelecao(s)).toBe('AFROPUNK BAHIA');
  });

  it('marcar AFROPUNK + outro => 2 projetos', () => {
    let s = desmarcarTodos();
    s = toggleProjeto(s, 'AFROPUNK BAHIA', OPTIONS);
    s = toggleProjeto(s, 'WSL', OPTIONS);
    expect(s.selectedProjects).toEqual(['AFROPUNK BAHIA', 'WSL']);
    expect(rotuloSelecao(s)).toBe('2 projetos selecionados');
  });

  it('desmarcar apenas um projeto partindo de Todos', () => {
    let s = selecionarTodos();
    s = toggleProjeto(s, 'WSL', OPTIONS);
    expect(s.selectionMode).toBe('custom');
    expect(s.selectedProjects).toEqual(OPTIONS.filter(o => o !== 'WSL'));
  });

  it('voltar para Todos ao marcar todos os disponíveis', () => {
    let s = desmarcarTodos();
    for (const o of OPTIONS) s = toggleProjeto(s, o, OPTIONS);
    expect(s.selectionMode).toBe('all');
    expect(s.selectedProjects).toEqual([]);
  });

  it('toggle de item já marcado remove da seleção', () => {
    let s: ProjectSelection = { selectionMode: 'custom', selectedProjects: ['WSL'] };
    s = toggleProjeto(s, 'WSL', OPTIONS);
    expect(s.selectedProjects).toEqual([]);
  });

  it('pesquisa não altera a seleção (SPORTV + WSL + AFROPUNK)', () => {
    let s = desmarcarTodos();
    s = toggleProjeto(s, 'SPORTV NEWS', OPTIONS);
    s = toggleProjeto(s, 'WSL', OPTIONS);

    const visiveis = filtrarProjetos(OPTIONS, 'AFROPUNK');
    expect(visiveis).toEqual(['AFROPUNK BAHIA']);

    s = toggleProjeto(s, 'AFROPUNK BAHIA', OPTIONS);
    // limpar a pesquisa não afeta a seleção
    filtrarProjetos(OPTIONS, '');
    expect(s.selectedProjects).toEqual(['AFROPUNK BAHIA', 'SPORTV NEWS', 'WSL']);

    const visiveisVazio = filtrarProjetos(OPTIONS, 'ZZZ');
    expect(visiveisVazio).toEqual([]);
    expect(s.selectedProjects).toEqual(['AFROPUNK BAHIA', 'SPORTV NEWS', 'WSL']);
  });
});
