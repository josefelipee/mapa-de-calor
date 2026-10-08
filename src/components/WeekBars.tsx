import { useLayoutEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react';
import type { SemanaMetricas } from '../types';
import { getCorRelativa } from '../config/heatmapConfig';
import { formatDataBR } from '../utils/dateUtils';

type Modo = 'total' | 'media' | 'pico';

const MODOS: { id: Modo; label: string }[] = [
  { id: 'total', label: 'Total' },
  { id: 'media', label: 'Média' },
  { id: 'pico', label: 'Pico' },
];

const TITULO: Record<Modo, string> = {
  total: 'Total por semana do ano',
  media: 'Média por semana do ano',
  pico: 'Pico por semana do ano',
};

interface WeekBarsProps {
  metricas: SemanaMetricas[];
  semanaSelecionada: number | null;
  onSemanaClick: (semana: number) => void;
}

export function WeekBars({ metricas, semanaSelecionada, onSemanaClick }: WeekBarsProps) {
  const [modo, setModo] = useState<Modo>('total');
  const [hover, setHover] = useState<{ m: SemanaMetricas; el: HTMLElement } | null>(null);

  const valorDe = (m: SemanaMetricas) => (modo === 'total' ? m.total : modo === 'media' ? m.media : m.pico);

  const valores = useMemo(() => metricas.map(valorDe).filter(v => v > 0), [metricas, modo]);
  const min = valores.length ? Math.min(...valores) : 0;
  const max = valores.length ? Math.max(...valores) : 0;
  const media = valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : 0;
  const maxBarra = Math.max(100, max);

  const { refs, floatingStyles } = useFloating({
    placement: 'right',
    middleware: [offset(8), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  useLayoutEffect(() => {
    if (hover) refs.setReference(hover.el);
  }, [hover, refs]);

  return (
    <aside className="sticky top-3 hidden h-[calc(100vh-12rem)] w-60 shrink-0 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white lg:flex">
      <div className="border-b border-gray-100 px-3 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Total semana por</p>
        <p className="text-[11px] font-bold uppercase tracking-wide text-gray-700">Semana do ano</p>

        <div className="mt-2 inline-flex w-full rounded-md border border-gray-300 bg-gray-50 p-0.5">
          {MODOS.map(m => (
            <button
              key={m.id}
              onClick={() => setModo(m.id)}
              className={`flex-1 rounded px-2 py-1 text-[11px] font-medium transition ${
                modo === m.id ? 'bg-corporate-900 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[9px] uppercase tracking-wider text-gray-400">{TITULO[modo]}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin">
        {metricas.length === 0 && (
          <p className="py-4 text-center text-xs text-gray-400">Sem semanas no período.</p>
        )}
        {metricas.map(m => {
          const valor = valorDe(m);
          const cor = valor > 0 ? getCorRelativa(valor, min, media, max) : undefined;
          const largura = valor > 0 ? Math.max(3, (valor / maxBarra) * 100) : 0;
          const selecionada = semanaSelecionada === m.semana;

          return (
            <button
              key={m.semana}
              onClick={() => onSemanaClick(m.semana)}
              onMouseEnter={e => setHover({ m, el: e.currentTarget })}
              onMouseLeave={() => setHover(null)}
              className={`flex w-full items-center gap-2 rounded-sm px-1 py-[3px] transition ${
                selecionada ? 'bg-blue-50 ring-1 ring-blue-300' : 'hover:bg-gray-50'
              }`}
            >
              <span
                className={`w-5 shrink-0 text-right text-[10px] tabular-nums ${
                  selecionada ? 'font-bold text-blue-700' : 'text-gray-400'
                }`}
              >
                {m.semana}
              </span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-sm bg-gray-100">
                {largura > 0 && (
                  <div className="h-full rounded-sm" style={{ width: `${largura}%`, backgroundColor: cor }} />
                )}
              </div>
              <span
                className={`w-9 shrink-0 text-right text-[10px] tabular-nums ${
                  selecionada ? 'font-bold text-blue-700' : 'text-gray-600'
                }`}
              >
                {Math.round(valor)}%
              </span>
            </button>
          );
        })}
      </div>

      {hover &&
        createPortal(
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="pointer-events-none z-[100] w-56 rounded-lg border border-gray-200 bg-white p-3 text-xs shadow-xl"
          >
            <p className="mb-1 font-semibold text-gray-900">Semana {hover.m.semana}</p>
            <div className="space-y-0.5 text-gray-600">
              <p className="flex justify-between">
                <span>Total:</span>
                <span className="font-medium text-gray-900">{Math.round(hover.m.total)}%</span>
              </p>
              <p className="flex justify-between">
                <span>Média diária:</span>
                <span className="font-medium text-gray-900">{Math.round(hover.m.media)}%</span>
              </p>
              <p className="flex justify-between">
                <span>Pico:</span>
                <span className="font-medium text-gray-900">{Math.round(hover.m.pico)}%</span>
              </p>
              <p className="pt-1 text-[11px] text-gray-500">
                Pico ocorrido em:{' '}
                <span className="font-medium text-gray-700">
                  {hover.m.picoData ? formatDataBR(hover.m.picoData) : '—'}
                </span>
              </p>
            </div>
          </div>,
          document.body
        )}
    </aside>
  );
}
