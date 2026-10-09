import type { Ocupacao } from '../../types';

/**
 * Abstração da camada de dados.
 * Hoje: FirestoreDataRepository (Cloud Firestore, banco nomeado).
 * A assinatura reflete operações assíncronas + tempo real.
 */
export interface DataRepository {
  /** Assina os dados em tempo real. Retorna a função de cancelamento. */
  subscribe(onData: (registros: Ocupacao[]) => void): () => void;
  /** Atualiza um registro. */
  update(registro: Ocupacao): Promise<void>;
  /** Atualiza vários registros em lote. */
  updateMany(registros: Ocupacao[]): Promise<void>;
  /** Restaura a base original (no Firestore: desabilitado nesta fase). */
  reset(): Promise<void>;
}
