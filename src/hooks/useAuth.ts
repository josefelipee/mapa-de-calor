import { useState, useCallback } from 'react';
import type { User, UserRole } from '../types';
import { EDITORS } from '../config/mockUsers';

const STORAGE_KEY = 'mapa-de-calor-user';

function determinarRole(email: string): UserRole {
  return EDITORS.includes(email.trim().toLowerCase()) ? 'editor' : 'viewer';
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as User;
      } catch {
        return null;
      }
    }
    return null;
  });

  const login = useCallback((email: string) => {
    const normalized = email.trim().toLowerCase();
    const newUser: User = { email: normalized, role: determinarRole(normalized) };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return { user, login, logout };
}
