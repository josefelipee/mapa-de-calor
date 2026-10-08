import { useState } from 'react';
import type { DiaCalculated } from '../types';
import { getFaixa, formatPercent } from '../config/heatmapConfig';
import { Tooltip } from './Tooltip';
import { agruparConteudosPorDia } from '../utils/calculations';

interface HeatmapCellProps {
  dia?: DiaCalculated;
  onClick?: (dia: DiaCalculated) => void;
}

export function HeatmapCell({ dia, onClick }: HeatmapCellProps) {
  const [hovered, setHovered] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  if (!dia) {
    return <div className="h-6 w-full rounded-[3px] bg-gray-50" />;
  }

  const faixa = getFaixa(dia.percentual);
  const conteudos = agruparConteudosPorDia(dia);

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX + 12, y: e.clientY + 12 });
  };

  return (
    <>
      <button
        onClick={() => onClick?.(dia)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseMove={handleMouseMove}
        className={`flex h-6 w-full items-center justify-center rounded-[3px] border ${faixa.bg} ${faixa.border} ${faixa.text} text-[10px] font-semibold tabular-nums transition hover:brightness-105 focus:outline-none focus:ring-1 focus:ring-blue-400`}
      >
        {formatPercent(dia.percentual)}
      </button>

      {hovered && (
        <Tooltip dia={dia} conteudos={conteudos} style={{ left: tooltipPos.x, top: tooltipPos.y }} />
      )}
    </>
  );
}
