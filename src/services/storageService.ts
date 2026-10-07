import type { Ocupacao } from '../types';
import ocupacoesOriginais from '../data/ocupacoes.json';

const STORAGE_KEY = 'mapa-de-calor-ocupacoes';

export function carregarOcupacoes(): Ocupacao[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as Ocupacao[];
    } catch {
      console.error('Erro ao ler localStorage');
    }
  }
  return ocupacoesOriginais as Ocupacao[];
}

export function salvarOcupacoes(ocupacoes: Ocupacao[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ocupacoes));
}

export function restaurarDadosOriginais(): void {
  localStorage.removeItem(STORAGE_KEY);
}
