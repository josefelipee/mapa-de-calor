import { useState } from 'react';
import type { DiaCalculated } from '../types';
import { getFaixa, formatPercent } from '../config/heatmapConfig';
import { Tooltip } from './Tooltip';
import { agruparConteudosPorDia } from '../utils/calculations';

interface HeatmapCellProps {
  dia?: DiaCalculated;
  onClick?: (dia: DiaCalculated) => void;
  detalhada?: boolean;
}

const TOP_N = 6;
const MAX_CHARS = 14;

function truncar(nome: string, max = MAX_CHARS): string {
  return nome.length > max ? `${nome.slice(0, max).trimEnd()}...` : nome;
}

export function HeatmapCell({ dia, onClick, detalhada = false }: HeatmapCellProps) {
  const [hovered, setHovered] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  if (!dia) {
    return <div className="h-6 w-full rounded-[3px] bg-gray-50" />;
  }

  const faixa = getFaixa(dia.percentual);
  const conteudos = agruparConteudosPorDia(dia);
  const top = conteudos.slice(0, TOP_N);
  const outros = conteudos.length - top.length;

  const abrir = () => onClick?.(dia);
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      abrir();
    }
  };

  const eventosMouse = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onMouseMove: (e: React.MouseEvent) => setPos({ x: e.clientX, y: e.clientY }),
  };

  if (!detalhada) {
    return (
      <>
        <div
          role="button"
          tabIndex={0}
          onClick={abrir}
          onKeyDown={onKeyDown}
          {...eventosMouse}
          className={`flex h-6 w-full cursor-pointer items-center justify-center rounded-[3px] border ${faixa.bg} ${faixa.border} ${faixa.text} text-[10px] font-semibold tabular-nums transition hover:brightness-105 focus:outline-none focus:ring-1 focus:ring-blue-400`}
        >
          {formatPercent(dia.percentual)}
        </div>
        {hovered && <Tooltip dia={dia} conteudos={conteudos} x={pos.x} y={pos.y} />}
      </>
    );
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={abrir}
        onKeyDown={onKeyDown}
        {...eventosMouse}
        className={`flex w-full cursor-pointer flex-col overflow-hidden rounded-[3px] border ${faixa.border} text-left transition hover:brightness-[1.02] focus:outline-none focus:ring-1 focus:ring-blue-400`}
      >
        <div
          className={`flex items-center justify-center py-0.5 text-[10px] font-semibold tabular-nums ${faixa.bg} ${faixa.text}`}
        >
          {formatPercent(dia.percentual)}
        </div>
        <div className="divide-y divide-gray-100 bg-white">
          {top.map(c => (
            <div
              key={c.projeto}
              className="flex items-center justify-between gap-1 overflow-hidden px-1 py-0 text-[8px] leading-[1.3]"
            >
              <span className="min-w-0 flex-1 truncate whitespace-nowrap text-gray-600" title={c.projeto}>
                {truncar(c.projeto)}
              </span>
              <span className="shrink-0 tabular-nums text-gray-500">{Math.round(c.percentual)}%</span>
            </div>
          ))}
          {outros > 0 && (
            <div className="truncate whitespace-nowrap px-1 py-0 text-[8px] font-medium leading-[1.3] text-blue-600">
              + Outros {outros}
            </div>
          )}
        </div>
      </div>
      {hovered && <Tooltip dia={dia} conteudos={conteudos} x={pos.x} y={pos.y} />}
    </>
  );
}
