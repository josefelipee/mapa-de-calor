import { useState, useMemo, useCallback } from 'react';
import type { Ocupacao, Filtros } from '../types';
import { dataRepository } from '../services/repository';
import { agruparPorDia, agruparPorSemana, calcularMetricasSemanais } from '../utils/calculations';

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
    const filtraProjeto = filtros.selectionMode === 'custom';
    return ocupacoes.filter(o => {
      if (o.data < filtros.dataInicial || o.data > filtros.dataFinal) return false;
      if (filtros.tipo !== 'TODOS' && o.tipo !== filtros.tipo) return false;
      if (filtraProjeto && !filtros.selectedProjects.includes(o.projeto)) return false;
      return true;
    });
  }, [
    ocupacoes,
    filtros.dataInicial,
    filtros.dataFinal,
    filtros.tipo,
    filtros.selectionMode,
    filtros.selectedProjects,
  ]);

  const dias = useMemo(() => agruparPorDia(dadosFiltrados), [dadosFiltrados]);
  const semanas = useMemo(() => agruparPorSemana(Array.from(dias.values())), [dias]);
  const metricasSemanais = useMemo(
    () => calcularMetricasSemanais(dias, filtros.dataInicial, filtros.dataFinal),
    [dias, filtros.dataInicial, filtros.dataFinal]
  );

  return {
    ocupacoes,
    dias,
    semanas,
    metricasSemanais,
    projetosDisponiveis,
    atualizarRegistro,
    restaurar,
  };
}
