import { useEffect, useRef, useState } from 'react';

interface ProjectFilterProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

const TODOS = 'TODOS';

export function ProjectFilter({ value, options, onChange }: ProjectFilterProps) {
  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  useEffect(() => {
    if (!open) setBusca('');
  }, [open]);

  const filtrados = options.filter(o => o.toLowerCase().includes(busca.trim().toLowerCase()));
  const label = value === TODOS ? 'Todos os projetos' : value;

  const selecionar = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-64 items-center justify-between gap-2 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-left text-sm text-gray-700 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <span className="truncate" title={label}>{label}</span>
        <svg className="h-3.5 w-3.5 shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-80 rounded-md border border-gray-200 bg-white shadow-xl">
          <div className="flex items-center gap-2 border-b border-gray-100 px-2.5 py-2">
            <svg className="h-3.5 w-3.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
            <input
              autoFocus
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar projeto..."
              className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto py-1 scrollbar-thin">
            <li>
              <button
                onClick={() => selecionar(TODOS)}
                className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-blue-50 ${value === TODOS ? 'font-semibold text-blue-700' : 'text-gray-700'}`}
              >
                Todos os projetos
              </button>
            </li>
            {filtrados.length === 0 && (
              <li className="px-3 py-2 text-xs text-gray-400">Nenhum projeto encontrado.</li>
            )}
            {filtrados.map(o => (
              <li key={o}>
                <button
                  onClick={() => selecionar(o)}
                  className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-blue-50 ${value === o ? 'font-semibold text-blue-700' : 'text-gray-700'}`}
                  title={o}
                >
                  <span className="line-clamp-2">{o}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
