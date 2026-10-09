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
import type { User, UserRole } from '../types';
import { EDITORS } from '../config/mockUsers';
import { auth, OIDC_PROVIDER_ID } from '../services/firebase';

const provider = new OAuthProvider(OIDC_PROVIDER_ID);
provider.addScope('openid');
provider.addScope('email');
provider.addScope('profile');

function determinarRole(email: string): UserRole {
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
    const unsub = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const email = (fbUser.email ?? '').toLowerCase();
        setUser({ email, role: determinarRole(email) });
      } else {
        setUser(null);
      }
      setCarregando(false);
    });
    return unsub;
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
