import { httpsCallable } from 'firebase/functions';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, functions } from './firebase';
import type { UserRole, UsuarioAcesso } from '../types';

const callSincronizar = httpsCallable(functions, 'sincronizarMeuAcesso');
const callDefinir = httpsCallable(functions, 'definirPapel');

/** Garante o doc usuarios/{uid} no login e retorna o papel efetivo. */
export async function sincronizarMeuAcesso(): Promise<UserRole> {
  const res = await callSincronizar();
  const role = (res.data as { role?: UserRole }).role ?? 'viewer';
  return role;
}

/** ADMIN adiciona/remove editor (backend valida o solicitante). */
export async function definirPapel(email: string, role: 'editor' | 'viewer'): Promise<void> {
  await callDefinir({ email, role });
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
            role: (data.role ?? 'viewer') as UserRole,
          };
        })
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      onData(lista);
    },
    erro => console.error('Erro ao listar usuários:', erro)
  );
}
