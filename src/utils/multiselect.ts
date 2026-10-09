import type { SelectionMode } from '../types';

export interface Selecao {
  selectionMode: SelectionMode;
  values: string[];
}

/** Todos selecionados. */
export function selecionarTodos(): Selecao {
  return { selectionMode: 'all', values: [] };
}

/** Nenhum selecionado. */
export function desmarcarTodos(): Selecao {
  return { selectionMode: 'custom', values: [] };
}

/**
 * Alterna uma opção. Se, após a operação, todas as opções disponíveis estiverem
 * marcadas, normaliza para 'all'.
 */
export function toggleSelecao(atual: Selecao, opcao: string, options: string[]): Selecao {
  const base = new Set(atual.selectionMode === 'all' ? options : atual.values);
  if (base.has(opcao)) base.delete(opcao);
  else base.add(opcao);

  const arr = options.filter(o => base.has(o));
  if (options.length > 0 && arr.length === options.length) {
    return { selectionMode: 'all', values: [] };
  }
  return { selectionMode: 'custom', values: arr };
}

/** O valor atende à seleção atual? (all = sempre; custom = precisa estar na lista). */
export function atendeSelecao(valor: string, selecao: Selecao): boolean {
  if (selecao.selectionMode === 'all') return true;
  return selecao.values.includes(valor);
}

/** Apenas filtra a lista visível; nunca altera a seleção. */
export function filtrarOpcoes(options: string[], busca: string): string[] {
  const q = busca.trim().toLowerCase();
  return options.filter(o => o.toLowerCase().includes(q));
}

export interface RotuloConfig {
  todos: string;
  nenhum: string;
  contar: (n: number) => string;
}

/** Texto exibido no campo fechado. */
export function rotuloSelecao(sel: Selecao, cfg: RotuloConfig): string {
  if (sel.selectionMode === 'all') return cfg.todos;
  const n = sel.values.length;
  if (n === 0) return cfg.nenhum;
  if (n === 1) return sel.values[0];
  return cfg.contar(n);
}
