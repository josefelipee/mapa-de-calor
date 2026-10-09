import { useEffect, useMemo, useRef, useState } from 'react';
import type { SelectionMode } from '../types';
import {
  desmarcarTodos,
  filtrarProjetos,
  rotuloSelecao,
  selecionarTodos,
  toggleProjeto,
  type ProjectSelection,
} from '../utils/projectSelection';

interface ProjectFilterProps {
  selectionMode: SelectionMode;
  selectedProjects: string[];
  options: string[];
  onChange: (selectionMode: SelectionMode, selectedProjects: string[]) => void;
}

function CheckIndicator({ checked }: { checked: boolean }) {
  return (
    <span
      className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
        checked ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white'
      }`}
    >
      {checked && (
        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 6.5l2.5 2.5L10 3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

export function ProjectFilter({
  selectionMode,
  selectedProjects,
  options,
  onChange,
}: ProjectFilterProps) {
  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const atual: ProjectSelection = { selectionMode, selectedProjects };
  const isAll = selectionMode === 'all';
  const nenhum = selectionMode === 'custom' && selectedProjects.length === 0;

  const selecionados = useMemo(
    () => (isAll ? new Set(options) : new Set(selectedProjects)),
    [isAll, options, selectedProjects]
  );

  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  useEffect(() => {
    if (!open) setBusca('');
  }, [open]);

  const label = rotuloSelecao(atual);
  const filtrados = filtrarProjetos(options, busca);

  const aplicar = (sel: ProjectSelection) => onChange(sel.selectionMode, sel.selectedProjects);
  const doSelecionarTodos = () => aplicar(selecionarTodos());
  const doDesmarcarTodos = () => aplicar(desmarcarTodos());
  const toggle = (p: string) => aplicar(toggleProjeto(atual, p, options));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-64 items-center justify-between gap-2 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-left text-sm text-gray-700 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <span className={`truncate ${nenhum ? 'text-gray-400' : ''}`} title={label}>
          {label}
        </span>
        <svg className="h-3.5 w-3.5 shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-30 mt-1 flex max-h-[min(520px,calc(100vh-40px))] w-80 flex-col rounded-md border border-gray-200 bg-white shadow-xl">
          {/* Ações fixas — sempre visíveis, fora da área de scroll */}
          <div className="shrink-0 border-b border-gray-100 py-1">
            <button
              type="button"
              onClick={doSelecionarTodos}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <CheckIndicator checked={isAll} />
              Selecionar todos
            </button>
            <button
              type="button"
              onClick={doDesmarcarTodos}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <CheckIndicator checked={nenhum} />
              Desmarcar todos
            </button>
          </div>

          {/* Busca (não altera seleção) */}
          <div className="flex shrink-0 items-center gap-2 border-b border-gray-100 px-2.5 py-2">
            <svg className="h-3.5 w-3.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                clipRule="evenodd"
              />
            </svg>
            <input
              autoFocus
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Pesquisar projeto..."
              className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
            />
          </div>

          {/* Lista — única área com scroll */}
          <ul className="min-h-0 flex-1 overflow-y-auto py-1 scrollbar-thin">
            {filtrados.length === 0 && (
              <li className="px-3 py-2 text-xs text-gray-400">Nenhum projeto encontrado.</li>
            )}
            {filtrados.map(o => (
              <li key={o}>
                <label className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-blue-50">
                  <input
                    type="checkbox"
                    checked={selecionados.has(o)}
                    onChange={() => toggle(o)}
                    className="h-3.5 w-3.5 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="truncate" title={o}>
                    {o}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
