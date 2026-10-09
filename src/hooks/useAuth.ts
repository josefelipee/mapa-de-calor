import { useCallback, useEffect, useState } from 'react';
import {
  OAuthProvider,
  browserSessionPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import type { User, UserRole } from '../types';
import { EDITORS } from '../config/mockUsers';
import { auth, db, OIDC_PROVIDER_ID } from '../services/firebase';
import { sincronizarMeuAcesso } from '../services/acessos';

const provider = new OAuthProvider(OIDC_PROVIDER_ID);
provider.addScope('openid');
provider.addScope('email');
provider.addScope('profile');

/**
 * Papel de fallback enquanto o backend de roles (usuarios/{uid}) não está publicado:
 * usa a allowlist de e-mails (EDITORS). Quando o doc existir/estiver acessível, ele prevalece.
 */
function roleFallback(email: string): UserRole {
  return EDITORS.includes(email.trim().toLowerCase()) ? 'editor' : 'viewer';
}

function descreverErro(error: unknown): string {
  const code = error && typeof error === 'object' && 'code' in error ? String((error as { code: string }).code) : '';
  const mapa: Record<string, string> = {
    'auth/popup-closed-by-user': 'A janela de acesso foi fechada antes da conclusão.',
    'auth/cancelled-popup-request': 'A janela de acesso foi fechada antes da conclusão.',
    'auth/popup-blocked': 'O navegador bloqueou a janela de login. Permita popups para este site.',
    'auth/unauthorized-domain': 'Este endereço ainda não está autorizado para login.',
    'auth/network-request-failed': 'Não foi possível conectar ao serviço de autenticação.',
    'auth/invalid-api-key': 'Não foi possível validar a configuração de acesso.',
    'auth/configuration-not-found': 'Não foi possível validar a configuração de acesso.',
    'auth/operation-not-allowed': 'Não foi possível validar a configuração de acesso.',
  };
  return mapa[code] || 'Não foi possível concluir o acesso. Tente novamente.';
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let unsubDoc: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (unsubDoc) {
        unsubDoc();
        unsubDoc = null;
      }
      if (!fbUser) {
        setUser(null);
        setCarregando(false);
        return;
      }

      const uid = fbUser.uid;
      const email = (fbUser.email ?? '').toLowerCase();
      const fallback = roleFallback(email);

      // Garante usuarios/{uid} (e aplica acessosPendentes) e a claim no primeiro acesso.
      sincronizarMeuAcesso().catch(e => console.error('Falha ao sincronizar acesso:', e));

      // Papel em tempo real a partir de usuarios/{uid}; fallback p/ allowlist (transição).
      unsubDoc = onSnapshot(
        doc(db, 'usuarios', uid),
        snap => {
          const role = (snap.data()?.role as UserRole) ?? fallback;
          setUser({ uid, email, role });
          setCarregando(false);
        },
        err => {
          console.error('Erro ao ler usuário (usando fallback por e-mail):', err);
          setUser({ uid, email, role: fallback });
          setCarregando(false);
        }
      );
    });

    return () => {
      unsubAuth();
      if (unsubDoc) unsubDoc();
    };
  }, []);

  const login = useCallback(async () => {
    setErro(null);
    try {
      await setPersistence(auth, browserSessionPersistence);
      await signInWithPopup(auth, provider);
    } catch (e) {
      setErro(descreverErro(e));
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  return { user, carregando, erro, login, logout };
}
