import { useEffect, useMemo, useRef, useState } from 'react';

interface ProjectFilterProps {
  selected: string[];
  options: string[];
  onChange: (selected: string[]) => void;
}

export function ProjectFilter({ selected, options, onChange }: ProjectFilterProps) {
  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const allRef = useRef<HTMLInputElement>(null);

  // Array vazio = "Todos". Seleção efetiva = tudo selecionado.
  const selecionados = useMemo(
    () => (selected.length === 0 ? new Set(options) : new Set(selected)),
    [selected, options]
  );

  const efetivos = options.filter(o => selecionados.has(o));
  const todosSelecionados = options.length > 0 && efetivos.length === options.length;
  const parcial = efetivos.length > 0 && !todosSelecionados;

  useEffect(() => {
    if (allRef.current) allRef.current.indeterminate = parcial;
  }, [parcial]);

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

  const filtrados = options.filter(o => o.toLowerCase().includes(busca.trim().toLowerCase()));

  const label =
    todosSelecionados || efetivos.length === 0
      ? 'Todos os projetos'
      : efetivos.length === 1
      ? efetivos[0]
      : `${efetivos.length} projetos selecionados`;

  const aplicar = (conjunto: Set<string>) => {
    const arr = options.filter(o => conjunto.has(o));
    onChange(arr.length === options.length ? [] : arr);
  };

  const toggle = (p: string) => {
    const set = new Set(efetivos);
    if (set.has(p)) set.delete(p);
    else set.add(p);
    aplicar(set);
  };

  const selecionarTodos = () => onChange([]);
  const limparSelecao = () => onChange([]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-64 items-center justify-between gap-2 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-left text-sm text-gray-700 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <span className="truncate" title={label}>
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
        <div className="absolute z-30 mt-1 w-80 rounded-md border border-gray-200 bg-white shadow-xl">
          <div className="flex items-center gap-2 border-b border-gray-100 px-2.5 py-2">
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

          <div className="border-b border-gray-100">
            <label className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <input
                ref={allRef}
                type="checkbox"
                checked={todosSelecionados}
                onChange={selecionarTodos}
                className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Selecionar todos
            </label>
          </div>

          <ul className="max-h-64 overflow-y-auto py-1 scrollbar-thin">
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

          <div className="border-t border-gray-100 px-2 py-1.5">
            <button
              type="button"
              onClick={limparSelecao}
              className="w-full rounded px-2 py-1 text-left text-xs font-medium text-blue-600 hover:bg-blue-50"
            >
              Limpar seleção
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
