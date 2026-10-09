import type { HistoricoAlteracao } from '../types';

const ROTULOS: Record<string, string> = {
  data: 'Data',
  novaColunaOrcada: 'Duração',
  statusRegistro: 'Status do Registro',
  projeto: 'Projeto / Conteúdo',
  tipo: 'Tipo',
  site: 'SITE',
  dtHrInicioRecurso: 'Início',
  dtHrFimRecurso: 'Fim',
};

function fmtValor(campo: string, v: unknown): string {
  if (v === null || v === undefined || v === '') return '—';
  if (campo === 'data' && typeof v === 'string') {
    const [y, m, d] = v.split('-');
    return d && m && y ? `${d}/${m}/${y}` : v;
  }
  if (campo === 'novaColunaOrcada') {
    return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return String(v);
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

export function HistoricoLista({ itens }: { itens: HistoricoAlteracao[] }) {
  if (itens.length === 0) {
    return <p className="py-6 text-center text-xs text-gray-400">Sem alterações registradas.</p>;
  }

  return (
    <ul className="space-y-3">
      {itens.map(h => (
        <li key={h.id} className="rounded-lg border border-gray-100 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-gray-700">{fmtDataHora(h.alteradoEm)}</span>
            <span className="truncate text-[11px] text-gray-400" title={h.usuarioEmail ?? ''}>
              {h.usuarioEmail ?? '—'}
            </span>
          </div>
          <div className="mt-2 space-y-1">
            {h.camposAlterados.map((c, i) => (
              <div key={i} className="flex items-baseline justify-between gap-3 text-xs">
                <span className="shrink-0 font-semibold uppercase tracking-wide text-gray-500">
                  {ROTULOS[c.campo] ?? c.campo}
                </span>
                <span className="text-right text-gray-600">
                  <span className="text-gray-400 line-through">{fmtValor(c.campo, c.anterior)}</span>
                  {' → '}
                  <span className="font-medium text-gray-800">{fmtValor(c.campo, c.novo)}</span>
                </span>
              </div>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
