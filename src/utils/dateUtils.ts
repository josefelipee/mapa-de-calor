import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function parseData(dataStr: string): Date {
  const [y, m, d] = dataStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

export function formatDataBR(dataStr: string): string {
  return format(parseISO(dataStr), 'dd/MM/yyyy', { locale: ptBR });
}

export function formatDataExtenso(dataStr: string): string {
  return format(parseISO(dataStr), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function formatMesAno(dataStr: string): string {
  return format(parseISO(dataStr), 'MMMM yyyy', { locale: ptBR }).toUpperCase();
}

export function getAno(dataStr: string): number {
  return parseISO(dataStr).getFullYear();
}

export function getMes(dataStr: string): number {
  return parseISO(dataStr).getMonth() + 1;
}

export function getNomeMes(dataStr: string): string {
  return format(parseISO(dataStr), 'MMM', { locale: ptBR }).toLowerCase();
}
