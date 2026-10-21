import { useState } from 'react';
import type { Filtros, ViewMode, StatusFiltro } from '../types';
import { TIPOS_VALORES } from '../config/heatmapConfig';
import { ProjectFilter } from './ProjectFilter';
import { TipoFilter } from './TipoFilter';
import { CanalFilter } from './CanalFilter';

interface FiltersProps {
  filtros: Filtros;
  onChange: (filtros: Filtros) => void;
  onExportar: () => void;
  exportando: boolean;
  projetosDisponiveis: string[];
  canaisDisponiveis: string[];
  totalRegistros: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  podeCriar?: boolean;
  onNovaAlocacao?: () => void;
  onImportarPlanilha?: () => void;
}

const STATUS_OPCOES: StatusFiltro[] = ['ATIVO', 'INATIVO', 'TODOS'];

const inputClass =
  'rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

export function Filters({
  filtros,
  onChange,
  onExportar,
  exportando,
  projetosDisponiveis,
  canaisDisponiveis,
  totalRegistros,
  viewMode,
  onViewModeChange,
  podeCriar,
  onNovaAlocacao,
  onImportarPlanilha,
}: FiltersProps) {
  const [acoesAbertas, setAcoesAbertas] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <h2 className="text-base font-semibold text-gray-900">Mapa de Calor de Ocupação</h2>
            <p className="text-xs text-gray-500">Ocupação diária.</p>
          </div>
          <div className="shrink-0 border-l border-gray-200 pl-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Registros exibidos</p>
            <p className="text-xl font-bold tabular-nums leading-tight text-corporate-900">
              {totalRegistros.toLocaleString('pt-BR')}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap items-end gap-3 lg:justify-end">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Projeto / Conteúdo</label>
            <ProjectFilter
              selectionMode={filtros.selectionMode}
              selectedProjects={filtros.selectedProjects}
              options={projetosDisponiveis}
              onChange={(selectionMode, selectedProjects) =>
                onChange({ ...filtros, selectionMode, selectedProjects })
              }
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Canal</label>
            <CanalFilter
              selectionMode={filtros.canaisSelectionMode}
              selectedCanais={filtros.selectedCanais}
              options={canaisDisponiveis}
              onChange={(canaisSelectionMode, selectedCanais) =>
                onChange({ ...filtros, canaisSelectionMode, selectedCanais })
              }
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
            <TipoFilter
              selectionMode={filtros.tiposSelectionMode}
              selectedTipos={filtros.selectedTipos}
              options={TIPOS_VALORES}
              onChange={(tiposSelectionMode, selectedTipos) =>
                onChange({ ...filtros, tiposSelectionMode, selectedTipos })
              }
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Status registro</label>
            <select
              value={filtros.statusRegistro}
              onChange={e => onChange({ ...filtros, statusRegistro: e.target.value as StatusFiltro })}
              className={inputClass}
            >
              {STATUS_OPCOES.map(s => (
                <option key={s} value={s}>{s}</option>
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

          <div className="flex flex-col">
            <button
              onClick={() => setAcoesAbertas(o => !o)}
              aria-expanded={acoesAbertas}
              className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Ações
              <svg
                className={`h-3.5 w-3.5 text-gray-400 transition-transform ${acoesAbertas ? 'rotate-180' : ''}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {acoesAbertas && (
        <div className="mt-3 flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 pt-3">
          {podeCriar && onNovaAlocacao && (
            <button
              onClick={onNovaAlocacao}
              className="rounded-md border border-blue-600 bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
              title="Nova alocação"
            >
              + Nova alocação
            </button>
          )}

          {podeCriar && onImportarPlanilha && (
            <button
              onClick={onImportarPlanilha}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              title="Importar planilha padrão (atualização em massa)"
            >
              Importar planilha
            </button>
          )}

          <button
            onClick={onExportar}
            disabled={exportando}
            className="rounded-md border border-emerald-600 bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            title="Exportar a base completa para Excel"
          >
            {exportando ? 'Exportando...' : 'Exportar Excel'}
          </button>
        </div>
      )}
    </div>
  );
}
