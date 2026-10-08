import { HEATMAP_FAIXAS } from '../config/heatmapConfig';

interface LegendProps {
  compact?: boolean;
}

export function Legend({ compact = false }: LegendProps) {
  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        {HEATMAP_FAIXAS.map(f => (
          <span key={f.label} className="flex items-center gap-1.5 text-[10px] text-gray-500">
            <span className={`h-2.5 w-2.5 rounded-[2px] ${f.bg}`} />
            {f.label}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        Legenda de cores (ocupação %)
      </p>
      <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
        {HEATMAP_FAIXAS.map(f => (
          <span key={f.label} className="flex items-center gap-2 text-xs text-gray-600">
            <span className={`h-3 w-3 rounded-[3px] ${f.bg}`} />
            {f.label}
          </span>
        ))}
      </div>
    </div>
  );
}
