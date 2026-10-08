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
}

export type UserRole = 'editor' | 'viewer';

export interface User {
  email: string;
  role: UserRole;
}

export interface Filtros {
  dataInicial: string;
  dataFinal: string;
  tipo: string;
  projeto: string;
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
