import type { Ocupacao, StatusRegistro, StatusFiltro } from '../types';
import { atendeSelecao, type Selecao } from './multiselect';

/** Garante statusRegistro válido (base antiga → ATIVO). */
export function normalizarOcupacao(o: Ocupacao): Ocupacao {
  const statusRegistro: StatusRegistro = o.statusRegistro === 'INATIVO' ? 'INATIVO' : 'ATIVO';
  return o.statusRegistro === statusRegistro ? o : { ...o, statusRegistro };
}

export interface ContextoMovimento {
  dataOrigem: string;
  projeto: string;
  tipos: Selecao; // seleção de tipos (all/custom)
  statusRegistro: StatusFiltro; // 'TODOS' | 'ATIVO' | 'INATIVO'
}

/**
 * Registros que COMPÕEM a célula visível e, portanto, serão movidos:
 * mesmo projeto + data de origem, respeitando os filtros de Tipo e Status em vigor.
 */
export function selecionarParaMover(ocupacoes: Ocupacao[], ctx: ContextoMovimento): Ocupacao[] {
  return ocupacoes.filter(o => {
    if (o.data !== ctx.dataOrigem) return false;
    if (o.projeto !== ctx.projeto) return false;
    if (!atendeSelecao(o.tipo, ctx.tipos)) return false;
    if (ctx.statusRegistro !== 'TODOS' && (o.statusRegistro ?? 'ATIVO') !== ctx.statusRegistro) return false;
    return true;
  });
}

/** Aplica a nova DATA aos registros, mantendo todo o restante intacto. */
export function comNovaData(registros: Ocupacao[], novaData: string): Ocupacao[] {
  return registros.map(r => ({ ...r, data: novaData }));
}
