export interface Ocupacao {
  id: string;
  data: string; // YYYY-MM-DD
  projeto: string;
  tipo: string;
  valor: number;
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
}

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
