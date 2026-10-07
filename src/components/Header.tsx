import { APP_TITLE, APP_SUBTITLE } from '../config/mockUsers';
import type { User } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="bg-corporate-900 text-white shadow-md">
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <div className="grid grid-cols-2 gap-0.5">
            <span className="h-2 w-2 rounded-[1px] bg-white/90" />
            <span className="h-2 w-2 rounded-[1px] bg-white/90" />
            <span className="h-2 w-2 rounded-[1px] bg-white/90" />
            <span className="h-2 w-2 rounded-[1px] bg-white/50" />
          </div>
          <div className="leading-tight">
            <h1 className="text-sm font-bold tracking-wider">{APP_TITLE}</h1>
            <p className="text-[10px] uppercase tracking-widest text-gray-400">{APP_SUBTITLE}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium">{user.email}</p>
            <span
              className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                user.role === 'editor' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              {user.role === 'editor' ? 'Editor' : 'Visualizador'}
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
