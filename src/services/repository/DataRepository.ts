import type { Ocupacao, Ator } from '../../types';

/**
 * Abstração da camada de dados (Cloud Firestore). Operações assíncronas + tempo real.
 * `ator` carrega quem executa (para atribuição/auditoria).
 */
export interface DataRepository {
  /** Assina os dados em tempo real. Retorna a função de cancelamento. */
  subscribe(onData: (registros: Ocupacao[]) => void): () => void;
  /** Atualiza um registro. */
  update(registro: Ocupacao, ator: Ator): Promise<void>;
  /** Atualiza vários registros em lote (mesmo operationId). */
  updateMany(registros: Ocupacao[], ator: Ator): Promise<void>;
  /** Restaura a base original (no Firestore: desabilitado nesta fase). */
  reset(): Promise<void>;
}
