import type { Ocupacao, StatusRegistro, StatusFiltro, Filtros } from '../types';
import { atendeSelecao, type Selecao } from './multiselect';
import { getWeekNumber, getWeekday } from './weekNumber';
import { getNomeMes } from './dateUtils';

/** Garante statusRegistro válido (base antiga → ATIVO). */
export function normalizarOcupacao(o: Ocupacao): Ocupacao {
  const statusRegistro: StatusRegistro = o.statusRegistro === 'INATIVO' ? 'INATIVO' : 'ATIVO';
  return o.statusRegistro === statusRegistro ? o : { ...o, statusRegistro };
}

/** Normaliza e recalcula os campos derivados de DATA. */
export function prepararOcupacao(o: Ocupacao): Ocupacao {
  const n = normalizarOcupacao(o);
  return {
    ...n,
    semana: getWeekNumber(n.data),
    dia: getWeekday(n.data),
    mes: getNomeMes(n.data),
  };
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

// ---------------------------------------------------------------------------
// Nova alocação (criação manual)
// ---------------------------------------------------------------------------

function novoId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

/** Cria um registro vazio para o formulário de Nova Alocação. */
export function criarRegistroVazio(data = ''): Ocupacao {
  return {
    id: novoId(),
    dtHrInicioRecurso: '',
    dtHrFimRecurso: '',
    semana: 0,
    dia: 0,
    mes: '',
    projeto: '',
    tipo: '',
    idPlanilha: '-',
    nmRecurso: '-',
    status: 'Alocação',
    tipo2: '-',
    site: '',
    data,
    hora2: null,
    horaOrcada: null,
    novaColunaOrcada: 0,
    statusRegistro: 'ATIVO',
  };
}

/** Valida uma nova alocação. Retorna a mensagem de erro ou null se válida. */
export function validarNovaAlocacao(o: Ocupacao): string | null {
  if (!o.data) return 'Informe a DATA.';
  if (!o.dtHrInicioRecurso) return 'Informe o início (DT_HR_INICIO_RECURSO).';
  if (!o.dtHrFimRecurso) return 'Informe o fim (DT_HR_FIM_RECURSO).';
  if (!o.projeto.trim()) return 'Informe o PROJETO / CONTEÚDO.';
  if (!o.tipo) return 'Informe o TIPO.';
  if (!o.status.trim()) return 'Informe o STATUS.';
  if (!o.site.trim()) return 'Informe o SITE.';
  if (!o.statusRegistro) return 'Informe o STATUS DO REGISTRO.';
  if (!(o.novaColunaOrcada > 0)) return 'DURAÇÃO deve ser maior que 0.';
  if (o.dtHrFimRecurso <= o.dtHrInicioRecurso) return 'O fim deve ser posterior ao início.';
  return null;
}

/** O registro ficaria visível com os filtros atuais (data/tipo/status/projeto)? */
export function registroVisivelComFiltros(o: Ocupacao, filtros: Filtros): boolean {
  if (o.data < filtros.dataInicial || o.data > filtros.dataFinal) return false;
  if (!atendeSelecao(o.tipo, { selectionMode: filtros.tiposSelectionMode, values: filtros.selectedTipos })) {
    return false;
  }
  if (filtros.statusRegistro !== 'TODOS' && (o.statusRegistro ?? 'ATIVO') !== filtros.statusRegistro) {
    return false;
  }
  if (filtros.selectionMode === 'custom' && !filtros.selectedProjects.includes(o.projeto)) {
    return false;
  }
  return true;
}

/** O usuário pode criar/editar? (editor ou admin) */
export function podeEditar(role: string): boolean {
  return role === 'editor' || role === 'admin';
}
