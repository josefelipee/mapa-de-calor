import { APP_TITLE, APP_SUBTITLE } from '../config/mockUsers';
import type { User } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onGerenciarAcessos?: () => void;
}

const ROLE_LABEL: Record<User['role'], string> = {
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Visualizador',
};

const ROLE_CLASS: Record<User['role'], string> = {
  admin: 'bg-amber-500 text-white',
  editor: 'bg-blue-600 text-white',
  viewer: 'bg-gray-700 text-gray-300',
};

export function Header({ user, onLogout, onGerenciarAcessos }: HeaderProps) {
  return (
    <header className="bg-corporate-900 text-white shadow-md">
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="Mapa de Calor"
            className="h-8 w-8 rounded-md object-contain"
          />
          <div className="leading-tight">
            <h1 className="text-sm font-bold tracking-wider">{APP_TITLE}</h1>
            <p className="text-[10px] uppercase tracking-widest text-gray-400">{APP_SUBTITLE}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user.role === 'admin' && onGerenciarAcessos && (
            <button
              onClick={onGerenciarAcessos}
              title="Gerenciar acessos"
              aria-label="Gerenciar acessos"
              className="rounded border border-gray-600 p-1.5 text-gray-300 hover:border-gray-400 hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6h.09A1.65 1.65 0 0010 3.09V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9v.09a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
            </button>
          )}

          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium">{user.email}</p>
            <span
              className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${ROLE_CLASS[user.role]}`}
            >
              {ROLE_LABEL[user.role]}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="rounded border border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-300 hover:border-gray-400 hover:text-white"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
