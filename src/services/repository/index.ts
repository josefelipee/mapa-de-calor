import type { DataRepository } from './DataRepository';
import { LocalDataRepository } from './LocalDataRepository';

export type { DataRepository } from './DataRepository';

/** Instância ativa da camada de dados. Trocar aqui ao migrar para Firestore. */
export const dataRepository: DataRepository = new LocalDataRepository();
