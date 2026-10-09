import type { DataRepository } from './DataRepository';
import { FirestoreDataRepository } from './FirestoreDataRepository';

export type { DataRepository } from './DataRepository';

/** Instância ativa da camada de dados (Cloud Firestore — banco nomeado). */
export const dataRepository: DataRepository = new FirestoreDataRepository();
