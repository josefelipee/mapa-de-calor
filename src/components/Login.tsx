import { useState } from 'react';
import { APP_TITLE, APP_SUBTITLE } from '../config/mockUsers';

interface LoginProps {
  onLogin: (email: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onLogin(email.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-wide text-gray-900">{APP_TITLE}</h1>
          <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider">{APP_SUBTITLE}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-mail corporativo
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu.email@empresa.com"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-corporate-900 px-4 py-2 text-sm font-medium text-white hover:bg-corporate-800 focus:outline-none focus:ring-2 focus:ring-corporate-900 focus:ring-offset-2"
          >
            Entrar
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-500 text-center">
          Digite qualquer e-mail. Editores configurados em <code>src/config/mockUsers.ts</code>.
        </p>
      </div>
    </div>
  );
}
