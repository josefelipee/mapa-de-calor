import { useMemo, useState } from 'react';
import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  size,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react';
import type { SelectionMode } from '../types';
import {
  desmarcarTodos,
  rotuloSelecao,
  selecionarTodos,
  toggleSelecao,
  type Selecao,
} from '../utils/multiselect';

interface TipoFilterProps {
  selectionMode: SelectionMode;
  selectedTipos: string[];
  options: string[];
  onChange: (selectionMode: SelectionMode, selectedTipos: string[]) => void;
}

const ROTULO = {
  todos: 'TODOS',
  nenhum: 'Nenhum tipo selecionado',
  contar: (n: number) => `${n} tipos selecionados`,
};

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

export function TipoFilter({ selectionMode, selectedTipos, options, onChange }: TipoFilterProps) {
  const [open, setOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    strategy: 'fixed',
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(4),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      size({
        padding: 8,
        apply({ availableHeight, availableWidth, elements, rects }) {
          const largura = Math.min(Math.max(rects.reference.width, 240), availableWidth);
          Object.assign(elements.floating.style, {
            width: `${Math.round(largura)}px`,
            maxHeight: `${Math.min(420, availableHeight)}px`,
          });
        },
      }),
    ],
  });

  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss]);

  const atual: Selecao = { selectionMode, values: selectedTipos };
  const isAll = selectionMode === 'all';
  const nenhum = selectionMode === 'custom' && selectedTipos.length === 0;

  const selecionados = useMemo(
    () => (isAll ? new Set(options) : new Set(selectedTipos)),
    [isAll, options, selectedTipos]
  );

  const label = rotuloSelecao(atual, ROTULO);

  const aplicar = (sel: Selecao) => onChange(sel.selectionMode, sel.values);
  const doSelecionarTodos = () => aplicar(selecionarTodos());
  const doDesmarcarTodos = () => aplicar(desmarcarTodos());
  const toggle = (t: string) => aplicar(toggleSelecao(atual, t, options));

  return (
    <div>
      <button
        type="button"
        ref={refs.setReference}
        {...getReferenceProps({ onClick: () => setOpen(o => !o) })}
        className="flex w-44 items-center justify-between gap-2 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-left text-sm text-gray-700 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="z-[200] grid grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-md border border-gray-200 bg-white shadow-xl"
          >
            <div className="border-b border-gray-100 py-1">
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

            <ul className="min-h-0 overflow-y-auto py-1 scrollbar-thin">
              {options.map(t => (
                <li key={t}>
                  <label className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-blue-50">
                    <input
                      type="checkbox"
                      checked={selecionados.has(t)}
                      onChange={() => toggle(t)}
                      className="h-3.5 w-3.5 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="truncate" title={t}>
                      {t}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </FloatingPortal>
      )}
    </div>
  );
}
