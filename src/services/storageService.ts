import type { Ocupacao } from '../types';
import ocupacoesOriginais from '../data/ocupacoes.json';

const STORAGE_KEY = 'mapa-de-calor-ocupacoes';

function ehRegistroValido(o: unknown): o is Ocupacao {
  if (!o || typeof o !== 'object') return false;
  const r = o as Record<string, unknown>;
  return (
    typeof r.id === 'string' &&
    typeof r.data === 'string' &&
    typeof r.projeto === 'string' &&
    typeof r.tipo === 'string' &&
    typeof r.novaColunaOrcada === 'number'
  );
}

export function carregarOcupacoes(): Ocupacao[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed: unknown = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(ehRegistroValido)) {
        return parsed as Ocupacao[];
      }
      // Formato antigo/inválido: descarta para usar a base original
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      console.error('Erro ao ler localStorage; usando base original.');
      localStorage.removeItem(STORAGE_KEY);
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
