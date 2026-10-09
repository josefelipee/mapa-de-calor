import { useState, useMemo, useCallback } from 'react';
import type { Ocupacao, Filtros } from '../types';
import { dataRepository } from '../services/repository';
import { agruparPorDia, agruparPorSemana, calcularMetricasSemanais } from '../utils/calculations';
import { selecionarParaMover, comNovaData } from '../utils/ocupacao';

function atendeStatus(statusRegistro: string | undefined, filtro: Filtros['statusRegistro']): boolean {
  if (filtro === 'TODOS') return true;
  return (statusRegistro ?? 'ATIVO') === filtro;
}

export function useOcupacoes(filtros: Filtros) {
  const [ocupacoes, setOcupacoes] = useState<Ocupacao[]>(() => dataRepository.getAll());

  const atualizarRegistro = useCallback((registro: Ocupacao) => {
    setOcupacoes(dataRepository.update(registro));
  }, []);

  const restaurar = useCallback(() => {
    dataRepository.reset();
    setOcupacoes(dataRepository.getAll());
  }, []);

  // Lista de projetos respeita Data + Tipo + Status, mas NÃO o próprio filtro de projeto.
  const projetosDisponiveis = useMemo(() => {
    const set = new Set<string>();
    for (const o of ocupacoes) {
      if (o.data < filtros.dataInicial || o.data > filtros.dataFinal) continue;
      if (filtros.tipo !== 'TODOS' && o.tipo !== filtros.tipo) continue;
      if (!atendeStatus(o.statusRegistro, filtros.statusRegistro)) continue;
      set.add(o.projeto);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [ocupacoes, filtros.dataInicial, filtros.dataFinal, filtros.tipo, filtros.statusRegistro]);

  const dadosFiltrados = useMemo(() => {
    const filtraProjeto = filtros.selectionMode === 'custom';
    return ocupacoes.filter(o => {
      if (o.data < filtros.dataInicial || o.data > filtros.dataFinal) return false;
      if (filtros.tipo !== 'TODOS' && o.tipo !== filtros.tipo) return false;
      if (!atendeStatus(o.statusRegistro, filtros.statusRegistro)) return false;
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
    filtros.statusRegistro,
  ]);

  const dias = useMemo(() => agruparPorDia(dadosFiltrados), [dadosFiltrados]);
  const semanas = useMemo(() => agruparPorSemana(Array.from(dias.values())), [dias]);
  const metricasSemanais = useMemo(
    () => calcularMetricasSemanais(dias, filtros.dataInicial, filtros.dataFinal),
    [dias, filtros.dataInicial, filtros.dataFinal]
  );

  const contarMoviveis = useCallback(
    (dataOrigem: string, projeto: string): number =>
      selecionarParaMover(ocupacoes, {
        dataOrigem,
        projeto,
        tipo: filtros.tipo,
        statusRegistro: filtros.statusRegistro,
      }).length,
    [ocupacoes, filtros.tipo, filtros.statusRegistro]
  );

  const moverAlocacao = useCallback(
    (dataOrigem: string, dataDestino: string, projeto: string): number => {
      const registros = selecionarParaMover(ocupacoes, {
        dataOrigem,
        projeto,
        tipo: filtros.tipo,
        statusRegistro: filtros.statusRegistro,
      });
      if (registros.length === 0) return 0;
      setOcupacoes(dataRepository.updateMany(comNovaData(registros, dataDestino)));
      return registros.length;
    },
    [ocupacoes, filtros.tipo, filtros.statusRegistro]
  );

  return {
    ocupacoes,
    dias,
    semanas,
    metricasSemanais,
    projetosDisponiveis,
    totalRegistros: dadosFiltrados.length,
    atualizarRegistro,
    contarMoviveis,
    moverAlocacao,
    restaurar,
  };
}
