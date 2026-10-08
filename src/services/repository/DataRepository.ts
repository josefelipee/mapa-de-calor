import type { Ocupacao } from '../../types';

/**
 * Abstração da camada de dados.
 * Hoje: LocalDataRepository (JSON + localStorage).
 * Futuro: FirestoreDataRepository — sem alterar Heatmap, Drawer, filtros ou cálculos.
 */
export interface DataRepository {
  /** Base completa efetiva (original + alterações persistidas). */
  getAll(): Ocupacao[];
  getById(id: string): Ocupacao | undefined;
  /** Atualiza um registro e retorna a base completa atualizada. */
  update(registro: Ocupacao): Ocupacao[];
  /** Restaura a base original. */
  reset(): void;
  /** Base completa para exportação (mesma de getAll, nome semântico). */
  exportAll(): Ocupacao[];
}
