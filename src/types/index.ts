export type StatusRegistro = 'ATIVO' | 'INATIVO';
export type StatusFiltro = StatusRegistro | 'TODOS';

export interface Ocupacao {
  id: string; // identificador interno (imutável)
  dtHrInicioRecurso: string; // ISO local YYYY-MM-DDTHH:mm
  dtHrFimRecurso: string; // ISO local YYYY-MM-DDTHH:mm
  semana: number; // recalculado a partir de `data`
  dia: number; // 1=seg ... 7=dom (recalculado a partir de `data`)
  mes: string; // abreviação pt (recalculado a partir de `data`)
  projeto: string; // DS_PROJETO_ENGENHARIA_PROJETO_PRODUTO
  tipo: string;
  idPlanilha: string; // campo "ID" da Tabela1 (somente leitura)
  nmRecurso: string;
  status: string;
  tipo2: string;
  site: string;
  data: string; // YYYY-MM-DD (editável, fonte de verdade da célula)
  hora2: number | null;
  horaOrcada: number | null;
  novaColunaOrcada: number; // valor usado nos cálculos de ocupação
  statusRegistro: StatusRegistro; // ATIVO | INATIVO (exclusão lógica)
  // Metadados de operação/auditoria (não entram em cálculos nem exportação):
  atualizadoPor?: string;
  atualizadoPorUid?: string;
  atualizadoEm?: unknown;
  ultimaOperacaoId?: string;
}

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface User {
  uid: string;
  email: string;
  role: UserRole;
}

export interface CampoAlterado {
  campo: string;
  anterior: unknown;
  novo: unknown;
}

export interface HistoricoAlteracao {
  id: string;
  ocupacaoId: string;
  acao: string;
  usuarioUid: string | null;
  usuarioEmail: string | null;
  alteradoEm: Date | null;
  operationId: string | null;
  camposAlterados: CampoAlterado[];
}

export interface UsuarioAcesso {
  uid: string;
  email: string;
  nome: string;
  role: UserRole;
}

/** Contexto de quem executa uma alteração (para auditoria/atribuição). */
export interface Ator {
  uid: string;
  email: string;
  operationId: string;
}

export type SelectionMode = 'all' | 'custom';

export interface Filtros {
  dataInicial: string;
  dataFinal: string;
  /** 'all' = todos os tipos; 'custom' = apenas selectedTipos. */
  tiposSelectionMode: SelectionMode;
  /** Tipos selecionados quando tiposSelectionMode = 'custom'. Vazio = nenhum. */
  selectedTipos: string[];
  /** 'all' = todos os projetos do período/tipo; 'custom' = apenas selectedProjects. */
  selectionMode: SelectionMode;
  /** Projetos selecionados quando selectionMode = 'custom'. Vazio = nenhum. */
  selectedProjects: string[];
  /** Filtro por status do registro. */
  statusRegistro: StatusFiltro;
}

export interface SemanaMetricas {
  semana: number;
  /** Soma dos percentuais diários da semana (= SUM/102*100). */
  total: number;
  /** Média dos percentuais diários (dias no intervalo; sem dado = 0%). */
  media: number;
  /** Maior percentual diário da semana. */
  pico: number;
  /** Data do pico (YYYY-MM-DD) ou null. */
  picoData: string | null;
}

export type ViewMode = 'macro' | 'detalhada';

export interface DiaCalculated {
  data: string;
  ano: number;
  mes: number;
  nomeMes: string;
  semana: number;
  diaSemana: number; // 1=seg, 7=dom
  total: number;
  percentual: number;
  registros: Ocupacao[];
}

export interface ConteudoAgregado {
  projeto: string;
  total: number;
  percentual: number;
}

export interface SemanaCalculated {
  ano: number;
  semana: number;
  total: number;
  percentual: number;
  dias: Map<number, DiaCalculated>; // diaSemana -> dia
}
