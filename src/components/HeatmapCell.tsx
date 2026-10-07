import { useState, useRef } from 'react';
import type { DiaCalculated } from '../types';
import { getFaixa, formatPercent } from '../config/heatmapConfig';
import { Tooltip } from './Tooltip';
import { agruparConteudosPorDia } from '../utils/calculations';

interface HeatmapCellProps {
  dia?: DiaCalculated;
  onClick?: (dia: DiaCalculated) => void;
}

const DIAS_LABEL = ['', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];

export function HeatmapCell({ dia, onClick }: HeatmapCellProps) {
  const [hovered, setHovered] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const cellRef = useRef<HTMLButtonElement>(null);

  if (!dia) {
    return <div className="h-10 rounded bg-gray-100" />;
  }

  const faixa = getFaixa(dia.percentual);
  const conteudos = agruparConteudosPorDia(dia);

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX + 12, y: e.clientY + 12 });
  };

  return (
    <>
      <button
        ref={cellRef}
        onClick={() => onClick?.(dia)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseMove={handleMouseMove}
        className={`relative h-10 w-full rounded border ${faixa.bg} ${faixa.border} ${faixa.text} flex items-center justify-center text-xs font-semibold shadow-sm transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1`}
      >
        {formatPercent(dia.percentual)}
      </button>

      {hovered && (
        <Tooltip
          dia={dia}
          conteudos={conteudos}
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
          }}
        />
      )}
    </>
  );
}

export { DIAS_LABEL };
