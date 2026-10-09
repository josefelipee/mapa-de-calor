import type { Ocupacao, Ator } from '../../types';
import type { DataRepository } from './DataRepository';
import ocupacoesOriginais from '../../data/ocupacoes.json';
import { prepararOcupacao } from '../../utils/ocupacao';

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

/** Implementação local (JSON + localStorage) — não é a ativa (ver FirestoreDataRepository). */
export class LocalDataRepository implements DataRepository {
  private listeners = new Set<(registros: Ocupacao[]) => void>();

  private carregar(): Ocupacao[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(ehRegistroValido)) {
          return (parsed as Ocupacao[]).map(prepararOcupacao);
        }
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    return (ocupacoesOriginais as Ocupacao[]).map(prepararOcupacao);
  }

  private salvar(ocupacoes: Ocupacao[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ocupacoes));
  }

  private emitir(): void {
    const dados = this.carregar();
    this.listeners.forEach(l => l(dados));
  }

  subscribe(onData: (registros: Ocupacao[]) => void): () => void {
    this.listeners.add(onData);
    onData(this.carregar());
    return () => {
      this.listeners.delete(onData);
    };
  }

  private comAtor(registro: Ocupacao, ator: Ator): Ocupacao {
    return {
      ...prepararOcupacao(registro),
      atualizadoPor: ator.email,
      atualizadoPorUid: ator.uid,
      atualizadoEm: new Date().toISOString(),
      ultimaOperacaoId: ator.operationId,
    };
  }

  async update(registro: Ocupacao, ator: Ator): Promise<void> {
    const atualizadas = this.carregar().map(o => (o.id === registro.id ? this.comAtor(registro, ator) : o));
    this.salvar(atualizadas);
    this.emitir();
  }

  async updateMany(registros: Ocupacao[], ator: Ator): Promise<void> {
    const porId = new Map(registros.map(r => [r.id, this.comAtor(r, ator)]));
    const atualizadas = this.carregar().map(o => porId.get(o.id) ?? o);
    this.salvar(atualizadas);
    this.emitir();
  }

  async reset(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
    this.emitir();
  }
}
