/** Canal que recebe destaque visual (azul) nos registros. */
export const CANAL_DESTAQUE = 'GETV';

export function ehCanalDestaque(canal: string | null | undefined): boolean {
  return (canal ?? '').trim().toUpperCase() === CANAL_DESTAQUE;
}

/** Classes do badge do canal (GETV azul; demais neutro). */
export function estiloCanal(canal: string): string {
  return ehCanalDestaque(canal) ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600';
}
