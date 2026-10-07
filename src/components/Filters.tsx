import type { Filtros } from '../types';
import { TIPOS_OPCOES } from '../config/heatmapConfig';

interface FiltersProps {
  filtros: Filtros;
  onChange: (filtros: Filtros) => void;
  onRestaurar: () => void;
}

export function Filters({ filtros, onChange, onRestaurar }: FiltersProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-end">
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-gray-900">Mapa de Calor de Ocupação</h2>
        <p className="text-xs text-gray-500">Visualize a ocupação por semana e dia da semana.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Data inicial</label>
          <input
            type="date"
            value={filtros.dataInicial}
            onChange={e => onChange({ ...filtros, dataInicial: e.target.value })}
            className="rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Data final</label>
          <input
            type="date"
            value={filtros.dataFinal}
            onChange={e => onChange({ ...filtros, dataFinal: e.target.value })}
            className="rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Tipo</label>
          <select
            value={filtros.tipo}
            onChange={e => onChange({ ...filtros, tipo: e.target.value })}
            className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {TIPOS_OPCOES.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onRestaurar}
          className="self-end rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
          title="Restaurar dados originais"
        >
          Restaurar dados
        </button>
      </div>
    </div>
  );
}
