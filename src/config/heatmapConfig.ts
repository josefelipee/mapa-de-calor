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

/**
 * Escala de cor RELATIVA — usada exclusivamente no gráfico lateral de semanas.
 * NÃO usa as faixas fixas do heatmap.
 * mínimo → verde claro | média → bege/laranja | máximo → vermelho
 * Cores em HSL: [h, s%, l%]
 */
const ESCALA_RELATIVA = {
  min: [135, 45, 60] as [number, number, number],
  meio: [42, 85, 62] as [number, number, number],
  max: [2, 72, 53] as [number, number, number],
  neutra: 'hsl(210, 12%, 72%)',
};

function interpolarHsl(a: [number, number, number], b: [number, number, number], t: number): string {
  const h = a[0] + (b[0] - a[0]) * t;
  const s = a[1] + (b[1] - a[1]) * t;
  const l = a[2] + (b[2] - a[2]) * t;
  return `hsl(${h.toFixed(1)}, ${s.toFixed(1)}%, ${l.toFixed(1)}%)`;
}

export function getCorRelativa(valor: number, min: number, media: number, max: number): string {
  if (!(max > min)) return ESCALA_RELATIVA.neutra;
  const clamp = (t: number) => Math.max(0, Math.min(1, t));

  if (valor <= media) {
    const t = media > min ? (valor - min) / (media - min) : 0;
    return interpolarHsl(ESCALA_RELATIVA.min, ESCALA_RELATIVA.meio, clamp(t));
  }
  const t = max > media ? (valor - media) / (max - media) : 1;
  return interpolarHsl(ESCALA_RELATIVA.meio, ESCALA_RELATIVA.max, clamp(t));
}
