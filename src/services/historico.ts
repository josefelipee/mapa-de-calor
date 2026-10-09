import { collection, getDocs, query, where } from 'firebase/firestore';
import type { HistoricoAlteracao } from '../types';
import { db } from './firebase';

const COLECAO = 'historicoAlteracoes';

function mapDoc(d: { id: string; data: () => Record<string, unknown> }): HistoricoAlteracao {
  const data = d.data();
  const ts = data.alteradoEm as { toDate?: () => Date } | undefined;
  return {
    id: d.id,
    ocupacaoId: String(data.ocupacaoId ?? ''),
    acao: String(data.acao ?? ''),
    usuarioUid: (data.usuarioUid as string) ?? null,
    usuarioEmail: (data.usuarioEmail as string) ?? null,
    alteradoEm: ts && typeof ts.toDate === 'function' ? ts.toDate() : null,
    operationId: (data.operationId as string) ?? null,
    camposAlterados: (data.camposAlterados as HistoricoAlteracao['camposAlterados']) ?? [],
  };
}

function ordenarDesc(itens: HistoricoAlteracao[]): HistoricoAlteracao[] {
  return itens.sort((a, b) => (b.alteradoEm?.getTime() ?? 0) - (a.alteradoEm?.getTime() ?? 0));
}

/** Histórico de um registro específico. */
export async function listarHistoricoPorOcupacao(ocupacaoId: string): Promise<HistoricoAlteracao[]> {
  const snap = await getDocs(query(collection(db, COLECAO), where('ocupacaoId', '==', ocupacaoId)));
  return ordenarDesc(snap.docs.map(mapDoc));
}

/** Histórico agregado de vários registros (ex.: todos os de um dia). */
export async function listarHistoricoPorOcupacoes(ids: string[]): Promise<HistoricoAlteracao[]> {
  const unicos = Array.from(new Set(ids.filter(Boolean)));
  if (unicos.length === 0) return [];

  const resultados: HistoricoAlteracao[] = [];
  for (let i = 0; i < unicos.length; i += 10) {
    const lote = unicos.slice(i, i + 10);
    const snap = await getDocs(query(collection(db, COLECAO), where('ocupacaoId', 'in', lote)));
    resultados.push(...snap.docs.map(mapDoc));
  }
  return ordenarDesc(resultados);
}
