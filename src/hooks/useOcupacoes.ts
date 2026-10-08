import { useState, useMemo, useCallback } from 'react';
import type { Ocupacao, Filtros } from '../types';
import { dataRepository } from '../services/repository';
import { agruparPorDia, agruparPorSemana, getSemanasDoIntervalo } from '../utils/calculations';

export function useOcupacoes(filtros: Filtros) {
  const [ocupacoes, setOcupacoes] = useState<Ocupacao[]>(() => dataRepository.getAll());

  const atualizarRegistro = useCallback((registro: Ocupacao) => {
    setOcupacoes(dataRepository.update(registro));
  }, []);

  const restaurar = useCallback(() => {
    dataRepository.reset();
    setOcupacoes(dataRepository.getAll());
  }, []);

  // Lista de projetos respeita Data + Tipo, mas NÃO o próprio filtro de projeto,
  // para que a lista de opções não se elimine após a seleção.
  const projetosDisponiveis = useMemo(() => {
    const set = new Set<string>();
    for (const o of ocupacoes) {
      if (o.data < filtros.dataInicial || o.data > filtros.dataFinal) continue;
      if (filtros.tipo !== 'TODOS' && o.tipo !== filtros.tipo) continue;
      set.add(o.projeto);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [ocupacoes, filtros.dataInicial, filtros.dataFinal, filtros.tipo]);

  const dadosFiltrados = useMemo(() => {
    return ocupacoes.filter(o => {
      if (o.data < filtros.dataInicial || o.data > filtros.dataFinal) return false;
      if (filtros.tipo !== 'TODOS' && o.tipo !== filtros.tipo) return false;
      if (filtros.projeto !== 'TODOS' && o.projeto !== filtros.projeto) return false;
      return true;
    });
  }, [ocupacoes, filtros.dataInicial, filtros.dataFinal, filtros.tipo, filtros.projeto]);

  const dias = useMemo(() => agruparPorDia(dadosFiltrados), [dadosFiltrados]);
  const semanas = useMemo(() => agruparPorSemana(Array.from(dias.values())), [dias]);
  const semanasNoIntervalo = useMemo(
    () => getSemanasDoIntervalo(filtros.dataInicial, filtros.dataFinal),
    [filtros.dataInicial, filtros.dataFinal]
  );

  return {
    ocupacoes,
    dias,
    semanas,
    semanasNoIntervalo,
    projetosDisponiveis,
    atualizarRegistro,
    restaurar,
  };
}
