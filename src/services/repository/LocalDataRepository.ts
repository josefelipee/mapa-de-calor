import type { Ocupacao } from '../../types';
import type { DataRepository } from './DataRepository';
import ocupacoesOriginais from '../../data/ocupacoes.json';
import { getWeekNumber, getWeekday } from '../../utils/weekNumber';
import { getNomeMes } from '../../utils/dateUtils';

const STORAGE_KEY = 'mapa-de-calor-ocupacoes';

function recalcularDerivados(registro: Ocupacao): Ocupacao {
  return {
    ...registro,
    semana: getWeekNumber(registro.data),
    dia: getWeekday(registro.data),
    mes: getNomeMes(registro.data),
  };
}

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

export class LocalDataRepository implements DataRepository {
  private carregar(): Ocupacao[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(ehRegistroValido)) {
          return parsed as Ocupacao[];
        }
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        console.error('Erro ao ler localStorage; usando base original.');
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    return ocupacoesOriginais as Ocupacao[];
  }

  private salvar(ocupacoes: Ocupacao[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ocupacoes));
  }

  getAll(): Ocupacao[] {
    return this.carregar();
  }

  getById(id: string): Ocupacao | undefined {
    return this.carregar().find(o => o.id === id);
  }

  update(registro: Ocupacao): Ocupacao[] {
    const atualizadas = this.carregar().map(o =>
      o.id === registro.id ? recalcularDerivados(registro) : o
    );
    this.salvar(atualizadas);
    return atualizadas;
  }

  reset(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  exportAll(): Ocupacao[] {
    return this.carregar();
  }
}
