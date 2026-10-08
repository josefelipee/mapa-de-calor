import { useLayoutEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react';
import type { DiaCalculated, ConteudoAgregado } from '../types';
import { formatDataBR } from '../utils/dateUtils';
import { formatPercent } from '../config/heatmapConfig';

interface TooltipProps {
  dia: DiaCalculated;
  conteudos: ConteudoAgregado[];
  x: number;
  y: number;
}

export function Tooltip({ dia, conteudos, x, y }: TooltipProps) {
  const virtualRef = useMemo(
    () => ({
      getBoundingClientRect: () => ({
        x,
        y,
        top: y,
        left: x,
        right: x,
        bottom: y,
        width: 0,
        height: 0,
      }),
    }),
    [x, y]
  );

  const { refs, floatingStyles } = useFloating({
    strategy: 'fixed',
    placement: 'right-start',
    middleware: [offset(14), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  useLayoutEffect(() => {
    refs.setPositionReference(virtualRef);
  }, [refs, virtualRef]);

  return createPortal(
    <div
      ref={refs.setFloating}
      style={floatingStyles}
      className="pointer-events-none z-[100] min-w-[280px] max-w-sm rounded-lg border border-gray-200 bg-white p-3 shadow-xl"
    >
      <div className="mb-2 border-b border-gray-100 pb-2">
        <p className="text-sm font-semibold text-gray-900">{formatDataBR(dia.data)}</p>
        <p className="text-xs text-gray-500">
          Ocupação: <span className="font-semibold text-gray-900">{formatPercent(dia.percentual)}</span>
        </p>
      </div>

      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-gray-400">
            <th className="pb-1 font-medium">Conteúdo</th>
            <th className="pb-1 text-right font-medium">Total</th>
            <th className="pb-1 text-right font-medium">% Total</th>
          </tr>
        </thead>
        <tbody>
          {conteudos.map(c => (
            <tr key={c.projeto} className="border-t border-gray-50">
              <td className="py-1 pr-2 font-medium text-gray-700 truncate max-w-[160px]" title={c.projeto}>
                {c.projeto}
              </td>
              <td className="py-1 pr-2 text-right text-gray-600">{c.total.toFixed(2)}</td>
              <td className="py-1 text-right font-medium text-gray-800">{formatPercent(c.percentual)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-gray-200 font-semibold">
            <td className="py-1 pr-2 text-gray-900">Total</td>
            <td className="py-1 pr-2 text-right text-gray-900">{dia.total.toFixed(2)}</td>
            <td className="py-1 text-right text-gray-900">{formatPercent(dia.percentual)}</td>
          </tr>
        </tfoot>
      </table>
    </div>,
    document.body
  );
}
