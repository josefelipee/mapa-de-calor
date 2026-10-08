import type { Filtros, ViewMode } from '../types';
import { TIPOS_OPCOES } from '../config/heatmapConfig';
import { ProjectFilter } from './ProjectFilter';

interface FiltersProps {
  filtros: Filtros;
  onChange: (filtros: Filtros) => void;
  onRestaurar: () => void;
  onExportar: () => void;
  exportando: boolean;
  projetosDisponiveis: string[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const inputClass =
  'rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

export function Filters({
  filtros,
  onChange,
  onRestaurar,
  onExportar,
  exportando,
  projetosDisponiveis,
  viewMode,
  onViewModeChange,
}: FiltersProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="shrink-0">
        <h2 className="text-base font-semibold text-gray-900">Mapa de Calor de Ocupação</h2>
        <p className="text-xs text-gray-500">Visualize a ocupação por semana e dia da semana.</p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Projeto / Conteúdo</label>
          <ProjectFilter
            selected={filtros.projetos}
            options={projetosDisponiveis}
            onChange={projetos => onChange({ ...filtros, projetos })}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Data inicial</label>
          <input
            type="date"
            value={filtros.dataInicial}
            onChange={e => onChange({ ...filtros, dataInicial: e.target.value })}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Data final</label>
          <input
            type="date"
            value={filtros.dataFinal}
            onChange={e => onChange({ ...filtros, dataFinal: e.target.value })}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Tipo</label>
          <select
            value={filtros.tipo}
            onChange={e => onChange({ ...filtros, tipo: e.target.value })}
            className={inputClass}
          >
            {TIPOS_OPCOES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Visão</label>
          <div className="inline-flex rounded-md border border-gray-300 bg-gray-50 p-0.5">
            {(['macro', 'detalhada'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`rounded px-3 py-1 text-xs font-medium capitalize transition ${
                  viewMode === mode
                    ? 'bg-corporate-900 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {mode === 'macro' ? 'Macro' : 'Detalhada'}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onRestaurar}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
          title="Restaurar dados originais"
        >
          Restaurar dados
        </button>

        <button
          onClick={onExportar}
          disabled={exportando}
          className="rounded-md border border-emerald-600 bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          title="Exportar a base completa para Excel"
        >
          {exportando ? 'Exportando...' : 'Exportar Excel'}
        </button>
      </div>
    </div>
  );
}
