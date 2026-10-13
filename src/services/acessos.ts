import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { HistoricoAcesso, Perfil, UsuarioAcesso } from '../types';

/** Auto-registro: cria usuarios/{uid} como 'visualizacao' se ainda não existir. */
export async function garantirMeuUsuario(uid: string, email: string, nome: string): Promise<void> {
  const ref = doc(db, 'usuarios', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  await setDoc(ref, {
    email,
    nome,
    perfil: 'visualizacao',
    atualizadoEm: serverTimestamp(),
  });
}

/** Lista usuários (leitura permitida ao admin). */
export function assinarUsuarios(onData: (usuarios: UsuarioAcesso[]) => void): () => void {
  return onSnapshot(
    collection(db, 'usuarios'),
    snap => {
      const lista: UsuarioAcesso[] = snap.docs
        .map(d => {
          const data = d.data();
          return {
            uid: d.id,
            email: String(data.email ?? ''),
            nome: String(data.nome ?? ''),
            perfil: (data.perfil ?? 'visualizacao') as Perfil,
          };
        })
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      onData(lista);
    },
    erro => console.error('Erro ao listar usuários:', erro)
  );
}

/** Histórico de acessos (leitura permitida ao admin). */
export function assinarHistoricoAcessos(onData: (itens: HistoricoAcesso[]) => void): () => void {
  const q = query(collection(db, 'historicoAcessos'), orderBy('executadoEm', 'desc'));
  return onSnapshot(
    q,
    snap => {
      const lista: HistoricoAcesso[] = snap.docs.map(d => {
        const data = d.data();
        const ts = data.executadoEm as { toDate?: () => Date } | undefined;
        return {
          id: d.id,
          usuarioAfetado: (data.usuarioAfetado as string) ?? null,
          usuarioUid: (data.usuarioUid as string) ?? null,
          perfilAnterior: (data.perfilAnterior as Perfil) ?? null,
          perfilNovo: (data.perfilNovo as Perfil) ?? null,
          executadoPor: (data.executadoPor as string) ?? null,
          executadoPorUid: (data.executadoPorUid as string) ?? null,
          executadoEm: ts && typeof ts.toDate === 'function' ? ts.toDate() : null,
        };
      });
      onData(lista);
    },
    erro => console.error('Erro ao listar histórico de acessos:', erro)
  );
}

/** ADMIN altera o perfil de um usuário (as Rules garantem que só admin consegue). */
export async function atualizarPerfil(
  uid: string,
  perfil: Perfil,
  admin: { uid: string; email: string }
): Promise<void> {
  await updateDoc(doc(db, 'usuarios', uid), {
    perfil,
    atualizadoPor: admin.email,
    atualizadoPorUid: admin.uid,
    atualizadoEm: serverTimestamp(),
  });
}
