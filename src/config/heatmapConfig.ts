export const CAPACIDADE = 102;

export interface CorFaixa {
  min: number;
  max: number;
  label: string;
  bg: string;
  text: string;
  border: string;
}

export const HEATMAP_FAIXAS: CorFaixa[] = [
  { min: 0, max: 80, label: '0–80%', bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-600' },
  { min: 81, max: 100, label: '81–100%', bg: 'bg-yellow-400', text: 'text-gray-900', border: 'border-yellow-500' },
  { min: 101, max: 120, label: '101–120%', bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-600' },
  { min: 121, max: Infinity, label: '>120%', bg: 'bg-red-600', text: 'text-white', border: 'border-red-700' },
];

export function getFaixa(percentual: number): CorFaixa {
  return HEATMAP_FAIXAS.find(f => percentual >= f.min && percentual <= f.max) || HEATMAP_FAIXAS[HEATMAP_FAIXAS.length - 1];
}

export function formatPercent(percentual: number): string {
  return `${Math.round(percentual)}%`;
}

export const TIPOS_OPCOES = [
  'TODOS',
  'EVENTO ESPORTIVO',
  'PROGRAMA',
  'SEM CONTROLE',
  'ENTRETENIMENTO',
];
