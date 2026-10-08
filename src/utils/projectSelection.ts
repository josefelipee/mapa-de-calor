import type { SelectionMode } from '../types';

export interface ProjectSelection {
  selectionMode: SelectionMode;
  selectedProjects: string[];
}

/** Todos os projetos disponíveis selecionados. */
export function selecionarTodos(): ProjectSelection {
  return { selectionMode: 'all', selectedProjects: [] };
}

/** Nenhum projeto selecionado. */
export function desmarcarTodos(): ProjectSelection {
  return { selectionMode: 'custom', selectedProjects: [] };
}

/**
 * Alterna um projeto. Se, após a operação, todos os projetos disponíveis
 * estiverem marcados, normaliza para 'all'.
 */
export function toggleProjeto(
  atual: ProjectSelection,
  opcao: string,
  options: string[]
): ProjectSelection {
  const base = new Set(atual.selectionMode === 'all' ? options : atual.selectedProjects);
  if (base.has(opcao)) base.delete(opcao);
  else base.add(opcao);

  const arr = options.filter(o => base.has(o));
  if (options.length > 0 && arr.length === options.length) {
    return { selectionMode: 'all', selectedProjects: [] };
  }
  return { selectionMode: 'custom', selectedProjects: arr };
}

/** Apenas filtra a lista visível; nunca altera a seleção. */
export function filtrarProjetos(options: string[], busca: string): string[] {
  const q = busca.trim().toLowerCase();
  return options.filter(o => o.toLowerCase().includes(q));
}

/** Texto exibido no campo fechado. */
export function rotuloSelecao(atual: ProjectSelection): string {
  if (atual.selectionMode === 'all') return 'Todos os projetos';
  const n = atual.selectedProjects.length;
  if (n === 0) return 'Nenhum projeto selecionado';
  if (n === 1) return atual.selectedProjects[0];
  return `${n} projetos selecionados`;
}

/** Um projeto está marcado? */
export function estaMarcado(atual: ProjectSelection, projeto: string): boolean {
  if (atual.selectionMode === 'all') return true;
  return atual.selectedProjects.includes(projeto);
}
