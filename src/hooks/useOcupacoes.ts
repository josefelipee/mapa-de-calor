import { useState, useMemo, useCallback } from 'react';
import type { Ocupacao, Filtros } from '../types';
import { carregarOcupacoes, salvarOcupacoes, restaurarDadosOriginais } from '../services/storageService';
import { agruparPorDia, agruparPorSemana } from '../utils/calculations';

export function useOcupacoes(filtros: Filtros) {
  const [ocupacoes, setOcupacoes] = useState<Ocupacao[]>(() => carregarOcupacoes());

  const atualizarOcupacao = useCallback((id: string, novoValor: number) => {
    setOcupacoes(prev => {
      const atualizadas = prev.map(o =>
        o.id === id ? { ...o, valor: novoValor } : o
      );
      salvarOcupacoes(atualizadas);
      return atualizadas;
    });
  }, []);

  const restaurar = useCallback(() => {
    restaurarDadosOriginais();
    setOcupacoes(carregarOcupacoes());
  }, []);

  const dadosFiltrados = useMemo(() => {
    return ocupacoes.filter(o => {
      if (o.data < filtros.dataInicial || o.data > filtros.dataFinal) return false;
      if (filtros.tipo !== 'TODOS' && o.tipo !== filtros.tipo) return false;
      return true;
    });
  }, [ocupacoes, filtros.dataInicial, filtros.dataFinal, filtros.tipo]);

  const dias = useMemo(() => agruparPorDia(dadosFiltrados), [dadosFiltrados]);
  const semanas = useMemo(() => agruparPorSemana(Array.from(dias.values())), [dias]);

  return {
    ocupacoes,
    dias,
    semanas,
    atualizarOcupacao,
    restaurar,
  };
}
