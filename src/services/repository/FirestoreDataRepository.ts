import {
  collection,
  doc,
  onSnapshot,
  writeBatch,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';
import type { Ocupacao } from '../../types';
import type { DataRepository } from './DataRepository';
import { db } from '../firebase';
import { prepararOcupacao } from '../../utils/ocupacao';

const COLECAO = 'ocupacoes';
const TAMANHO_LOTE = 400;

function docParaOcupacao(id: string, data: DocumentData): Ocupacao {
  return prepararOcupacao({ id, ...(data as Omit<Ocupacao, 'id'>) } as Ocupacao);
}

export class FirestoreDataRepository implements DataRepository {
  subscribe(onData: (registros: Ocupacao[]) => void): () => void {
    const unsub: Unsubscribe = onSnapshot(
      collection(db, COLECAO),
      snapshot => {
        onData(snapshot.docs.map(d => docParaOcupacao(d.id, d.data())));
      },
      erro => console.error('Erro ao ler ocupações do Firestore:', erro)
    );
    return unsub;
  }

  async update(registro: Ocupacao): Promise<void> {
    await this.updateMany([registro]);
  }

  async updateMany(registros: Ocupacao[]): Promise<void> {
    for (let i = 0; i < registros.length; i += TAMANHO_LOTE) {
      const batch = writeBatch(db);
      for (const registro of registros.slice(i, i + TAMANHO_LOTE)) {
        const { id, ...campos } = prepararOcupacao(registro);
        batch.set(doc(db, COLECAO, id), campos);
      }
      await batch.commit();
    }
  }

  async reset(): Promise<void> {
    // Restauração desabilitada nesta fase (não apaga dados do Firestore).
  }
}
