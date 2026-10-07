import { useState, useEffect } from 'react';
import type { DiaCalculated, User } from '../types';
import { formatDataExtenso } from '../utils/dateUtils';
import { formatPercent } from '../config/heatmapConfig';

interface DrawerProps {
  dia: DiaCalculated | null;
  user: User;
  onClose: () => void;
  onSave: (id: string, novoValor: number) => void;
}

export function Drawer({ dia, user, onClose, onSave }: DrawerProps) {
  const [valores, setValores] = useState<Record<string, string>>({});
  const isEditor = user.role === 'editor';

  useEffect(() => {
    if (dia) {
      const map: Record<string, string> = {};
      for (const r of dia.registros) {
        map[r.id] = r.valor.toString();
      }
      setValores(map);
    }
  }, [dia]);

  if (!dia) return null;

  const handleChange = (id: string, value: string) => {
    setValores(prev => ({ ...prev, [id]: value }));
  };

  const handleSalvar = () => {
    for (const r of dia.registros) {
      const novo = parseFloat(valores[r.id]);
      if (!isNaN(novo) && novo !== r.valor) {
        onSave(r.id, novo);
      }
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md transform bg-white shadow-2xl transition-transform">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Semana {dia.semana}
              </p>
              <h2 className="text-lg font-semibold text-gray-900">{formatDataExtenso(dia.data)}</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
            <p className="text-sm text-gray-600">
              Ocupação total:{' '}
              <span className="text-lg font-bold text-gray-900">{formatPercent(dia.percentual)}</span>
              <span className="ml-2 text-xs text-gray-500">({dia.total.toFixed(2)})</span>
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="text-left text-xs text-gray-500">
                  <th className="pb-2 font-semibold">Conteúdo</th>
                  <th className="pb-2 text-right font-semibold">Valor</th>
                  <th className="pb-2 text-right font-semibold">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dia.registros.map(r => {
                  const percentual = (r.valor / 102) * 100;
                  return (
                    <tr key={r.id}>
                      <td className="py-2 pr-3 text-gray-800" title={r.projeto}>
                        <div className="max-w-[220px] truncate">{r.projeto}</div>
                        <div className="text-[10px] text-gray-400">{r.tipo}</div>
                      </td>
                      <td className="py-2 pr-3 text-right">
                        {isEditor ? (
                          <input
                            type="number"
                            step="0.01"
                            value={valores[r.id] ?? r.valor}
                            onChange={e => handleChange(r.id, e.target.value)}
                            className="w-24 rounded border border-gray-300 px-2 py-1 text-right text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        ) : (
                          <span className="text-gray-700">{r.valor.toFixed(2)}</span>
                        )}
                      </td>
                      <td className="py-2 text-right text-xs font-medium text-gray-600">
                        {formatPercent(percentual)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-100 px-5 py-4">
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              {isEditor && (
                <button
                  onClick={handleSalvar}
                  className="rounded-md bg-corporate-900 px-4 py-2 text-sm font-medium text-white hover:bg-corporate-800"
                >
                  Salvar alterações
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
