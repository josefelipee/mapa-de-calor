export const CAPACIDADE = 102;

export interface CorFaixa {
  max: number;
  label: string;
  bg: string;
  text: string;
  border: string;
}

/**
 * Faixas de cor por teto contínuo (sem lacunas).
 * A cor é aplicada sobre o percentual arredondado (o mesmo número exibido),
 * garantindo que 80% = verde, 85% = amarelo, 116% = laranja e 148% = vermelho.
 */
export const HEATMAP_FAIXAS: CorFaixa[] = [
  { max: 80, label: '0 – 80%', bg: 'bg-[#79c879]', border: 'border-[#66b366]', text: 'text-white' },
  { max: 100, label: '81 – 100%', bg: 'bg-[#f4c542]', border: 'border-[#e0b132]', text: 'text-gray-900' },
  { max: 120, label: '101 – 120%', bg: 'bg-[#f2994a]', border: 'border-[#dd8637]', text: 'text-white' },
  { max: Infinity, label: '> 120%', bg: 'bg-[#eb5757]', border: 'border-[#d64545]', text: 'text-white' },
];

export function getFaixa(percentual: number): CorFaixa {
  const valor = Math.round(percentual);
  return HEATMAP_FAIXAS.find(f => valor <= f.max) ?? HEATMAP_FAIXAS[HEATMAP_FAIXAS.length - 1];
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

export const MESES_ABREV = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

export const MESES_EXTENSO = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
