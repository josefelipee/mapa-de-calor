import { parseData } from './dateUtils';

/**
 * Reproduz WEEKNUM(date, 2) do Excel:
 * - Semana começa na segunda-feira.
 * - Semana que contém 1º de janeiro é a semana 1.
 */
export function getWeekNumber(dateInput: string | Date): number {
  const date = typeof dateInput === 'string' ? parseData(dateInput) : dateInput;

  const year = date.getUTCFullYear();
  const firstDayOfYear = new Date(Date.UTC(year, 0, 1, 12, 0, 0));
  const firstWeekStart = getWeekStart(firstDayOfYear);

  const diff = date.getTime() - firstWeekStart.getTime();
  const daysDiff = Math.floor(diff / (24 * 60 * 60 * 1000));
  return Math.floor(daysDiff / 7) + 1;
}

/**
 * Reproduz WEEKDAY(date, 2) do Excel:
 * segunda=1, terça=2, quarta=3, quinta=4, sexta=5, sábado=6, domingo=7
 */
export function getWeekday(dateInput: string | Date): number {
  const date = typeof dateInput === 'string' ? parseData(dateInput) : dateInput;
  const jsDay = date.getUTCDay(); // 0=dom, 1=seg, ..., 6=sab
  return jsDay === 0 ? 7 : jsDay;
}

/**
 * Retorna a segunda-feira que inicia a semana da data informada,
 * considerando a regra de semana que começa na segunda.
 */
export function getWeekStart(date: Date): Date {
  const weekday = getWeekday(date);
  const diff = weekday - 1; // dias para voltar até segunda
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - diff, 12, 0, 0));
}
