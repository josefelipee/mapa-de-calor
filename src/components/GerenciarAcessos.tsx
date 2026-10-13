import { useEffect, useState } from 'react';
import { ADMIN_UIDS } from '../config/mockUsers';
import { assinarHistoricoAcessos, assinarUsuarios, atualizarPerfil } from '../services/acessos';
import type { HistoricoAcesso, Perfil, User, UsuarioAcesso } from '../types';

interface GerenciarAcessosProps {
  user: User;
  onClose: () => void;
}

const PERFIL_LABEL: Record<Perfil, string> = {
  visualizacao: 'Visualizador',
  editor: 'Editor',
};

function ehAdminUid(uid: string): boolean {
  return ADMIN_UIDS.includes(uid);
}

function fmtDataHora(d: Date | null): string {
  if (!d) return '—';
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function GerenciarAcessos({ user, onClose }: GerenciarAcessosProps) {
  const [tab, setTab] = useState<'usuarios' | 'historico'>('usuarios');
  const [usuarios, setUsuarios] = useState<UsuarioAcesso[]>([]);
  const [historico, setHistorico] = useState<HistoricoAcesso[]>([]);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => assinarUsuarios(setUsuarios), []);
  useEffect(() => assinarHistoricoAcessos(setHistorico), []);

  const alterar = async (u: UsuarioAcesso, novo: Perfil) => {
    const acao = novo === 'editor' ? 'Conceder edição a' : 'Remover edição de';
    if (!confirm(`${acao} ${u.email}?`)) return;
    setErro(null);
    setMsg(null);
    setOcupado(u.uid);
    try {
      await atualizarPerfil(u.uid, novo, { uid: user.uid, email: user.email });
      setMsg(`${u.email} → ${PERFIL_LABEL[novo]}.`);
    } catch {
      setErro('Não foi possível atualizar a permissão. Tente novamente.');
    } finally {
      setOcupado(null);
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

        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setTab('usuarios')}
            className={`flex-1 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              tab === 'usuarios' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Usuários
          </button>
          <button
            onClick={() => setTab('historico')}
            className={`flex-1 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              tab === 'historico' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Histórico de acessos
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
          {tab === 'usuarios' ? (
            <>
              <ul className="space-y-1.5">
                {usuarios.map(u => {
                  const admin = ehAdminUid(u.uid);
                  return (
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
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                            admin
                              ? 'bg-amber-100 text-amber-800'
                              : u.perfil === 'editor'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {admin ? 'ADMIN' : PERFIL_LABEL[u.perfil]}
                        </span>
                        {!admin &&
                          (u.perfil === 'editor' ? (
                            <button
                              onClick={() => alterar(u, 'visualizacao')}
                              disabled={ocupado === u.uid}
                              className="rounded-md border border-red-200 px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                            >
                              Remover editor
                            </button>
                          ) : (
                            <button
                              onClick={() => alterar(u, 'editor')}
                              disabled={ocupado === u.uid}
                              className="rounded-md border border-blue-200 px-2 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-60"
                            >
                              Promover p/ editor
                            </button>
                          ))}
                      </div>
                    </li>
                  );
                })}
                {usuarios.length === 0 && (
                  <li className="py-6 text-center text-xs text-gray-400">Nenhum usuário ainda.</li>
                )}
              </ul>
              <p className="mt-3 text-[11px] text-gray-400">
                Para alguém virar editor, a pessoa precisa ter entrado ao menos uma vez no sistema.
              </p>
            </>
          ) : (
            <ul className="space-y-3">
              {historico.map(h => (
                <li key={h.id} className="rounded-lg border border-gray-100 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-gray-700">{fmtDataHora(h.executadoEm)}</span>
                    <span className="truncate text-[11px] text-gray-400" title={h.executadoPor ?? ''}>
                      {h.executadoPor ?? '—'}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm font-medium text-gray-800" title={h.usuarioAfetado ?? ''}>
                    {h.usuarioAfetado ?? '—'}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-600">
                    {h.perfilAnterior ? PERFIL_LABEL[h.perfilAnterior] : '—'}
                    {' → '}
                    <span className="font-medium text-gray-800">
                      {h.perfilNovo ? PERFIL_LABEL[h.perfilNovo] : '—'}
                    </span>
                  </p>
                </li>
              ))}
              {historico.length === 0 && (
                <li className="py-6 text-center text-xs text-gray-400">Sem alterações de permissão.</li>
              )}
            </ul>
          )}
        </div>

        {(msg || erro) && (
          <div className="border-t border-gray-100 px-5 py-3">
            {msg && <p className="text-xs text-emerald-600">{msg}</p>}
            {erro && <p className="text-xs text-red-600">{erro}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
