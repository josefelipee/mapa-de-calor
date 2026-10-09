import { useEffect, useState } from 'react';
import { assinarUsuarios, definirPapel } from '../services/acessos';
import type { UsuarioAcesso } from '../types';

interface GerenciarAcessosProps {
  onClose: () => void;
}

const ROLE_LABEL: Record<UsuarioAcesso['role'], string> = {
  admin: 'ADMIN',
  editor: 'EDITOR',
  viewer: 'VIEWER',
};

const ROLE_CLASS: Record<UsuarioAcesso['role'], string> = {
  admin: 'bg-amber-100 text-amber-800',
  editor: 'bg-blue-100 text-blue-800',
  viewer: 'bg-gray-100 text-gray-600',
};

export function GerenciarAcessos({ onClose }: GerenciarAcessosProps) {
  const [usuarios, setUsuarios] = useState<UsuarioAcesso[]>([]);
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => assinarUsuarios(setUsuarios), []);

  const adicionar = async () => {
    setErro(null);
    setMsg(null);
    const e = email.trim().toLowerCase();
    if (!e) return;
    setOcupado(true);
    try {
      await definirPapel(e, 'editor');
      setMsg(`${e} agora é EDITOR.`);
      setEmail('');
    } catch {
      setErro('Não foi possível adicionar. Verifique a permissão e tente novamente.');
    } finally {
      setOcupado(false);
    }
  };

  const remover = async (u: UsuarioAcesso) => {
    if (!confirm(`Remover permissão de edição de ${u.email}?`)) return;
    setErro(null);
    setMsg(null);
    setOcupado(true);
    try {
      await definirPapel(u.email, 'viewer');
      setMsg(`${u.email} agora é VIEWER.`);
    } catch {
      setErro('Não foi possível remover. Tente novamente.');
    } finally {
      setOcupado(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Administração</p>
            <h2 className="text-lg font-semibold text-gray-900">Gerenciar acessos</h2>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
          <ul className="space-y-1.5">
            {usuarios.map(u => (
              <li
                key={u.uid}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800" title={u.nome}>
                    {u.nome || u.email}
                  </p>
                  <p className="truncate text-xs text-gray-500" title={u.email}>
                    {u.email}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${ROLE_CLASS[u.role]}`}>
                    {ROLE_LABEL[u.role]}
                  </span>
                  {u.role === 'editor' && (
                    <button
                      onClick={() => remover(u)}
                      disabled={ocupado}
                      className="rounded-md border border-red-200 px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                    >
                      Remover editor
                    </button>
                  )}
                </div>
              </li>
            ))}
            {usuarios.length === 0 && <li className="py-6 text-center text-xs text-gray-400">Nenhum usuário.</li>}
          </ul>

          <div className="mt-5 border-t border-gray-100 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Adicionar editor</p>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="usuario@g.globo"
                className="min-w-0 flex-1 rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={adicionar}
                disabled={ocupado || !email.trim()}
                className="shrink-0 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Adicionar como editor
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-gray-400">
              Se o usuário ainda não acessou o sistema, a permissão é aplicada no primeiro login.
            </p>
          </div>

          {msg && <p className="mt-3 text-xs text-emerald-600">{msg}</p>}
          {erro && <p className="mt-3 text-xs text-red-600">{erro}</p>}
        </div>
      </div>
    </div>
  );
}
