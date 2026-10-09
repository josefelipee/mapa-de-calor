import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Ocupacao, Filtros } from '../types';
import { dataRepository } from '../services/repository';
import { agruparPorDia, agruparPorSemana, calcularMetricasSemanais } from '../utils/calculations';
import { selecionarParaMover, comNovaData } from '../utils/ocupacao';
import { atendeSelecao, type Selecao } from '../utils/multiselect';

function atendeStatus(statusRegistro: string | undefined, filtro: Filtros['statusRegistro']): boolean {
  if (filtro === 'TODOS') return true;
  return (statusRegistro ?? 'ATIVO') === filtro;
}

export function useOcupacoes(filtros: Filtros) {
  const [ocupacoes, setOcupacoes] = useState<Ocupacao[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const unsub = dataRepository.subscribe(registros => {
      setOcupacoes(registros);
      setCarregando(false);
    });
    return unsub;
  }, []);

  const atualizarRegistro = useCallback((registro: Ocupacao) => {
    void dataRepository.update(registro);
  }, []);

  const restaurar = useCallback(() => {
    void dataRepository.reset();
  }, []);

  // Lista de projetos respeita Data + Tipos + Status, mas NÃO o próprio filtro de projeto.
  const projetosDisponiveis = useMemo(() => {
    const set = new Set<string>();
    for (const o of ocupacoes) {
      if (o.data < filtros.dataInicial || o.data > filtros.dataFinal) continue;
      if (!atendeSelecao(o.tipo, { selectionMode: filtros.tiposSelectionMode, values: filtros.selectedTipos })) continue;
      if (!atendeStatus(o.statusRegistro, filtros.statusRegistro)) continue;
      set.add(o.projeto);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [
    ocupacoes,
    filtros.dataInicial,
    filtros.dataFinal,
    filtros.tiposSelectionMode,
    filtros.selectedTipos,
    filtros.statusRegistro,
  ]);

  const dadosFiltrados = useMemo(() => {
    const filtraProjeto = filtros.selectionMode === 'custom';
    const selTipos: Selecao = {
      selectionMode: filtros.tiposSelectionMode,
      values: filtros.selectedTipos,
    };
    return ocupacoes.filter(o => {
      if (o.data < filtros.dataInicial || o.data > filtros.dataFinal) return false;
      if (!atendeSelecao(o.tipo, selTipos)) return false;
      if (!atendeStatus(o.statusRegistro, filtros.statusRegistro)) return false;
      if (filtraProjeto && !filtros.selectedProjects.includes(o.projeto)) return false;
      return true;
    });
  }, [
    ocupacoes,
    filtros.dataInicial,
    filtros.dataFinal,
    filtros.tiposSelectionMode,
    filtros.selectedTipos,
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
        tipos: { selectionMode: filtros.tiposSelectionMode, values: filtros.selectedTipos },
        statusRegistro: filtros.statusRegistro,
      }).length,
    [ocupacoes, filtros.tiposSelectionMode, filtros.selectedTipos, filtros.statusRegistro]
  );

  const moverAlocacao = useCallback(
    (dataOrigem: string, dataDestino: string, projeto: string): number => {
      const registros = selecionarParaMover(ocupacoes, {
        dataOrigem,
        projeto,
        tipos: { selectionMode: filtros.tiposSelectionMode, values: filtros.selectedTipos },
        statusRegistro: filtros.statusRegistro,
      });
      if (registros.length === 0) return 0;
      void dataRepository.updateMany(comNovaData(registros, dataDestino));
      return registros.length;
    },
    [ocupacoes, filtros.tiposSelectionMode, filtros.selectedTipos, filtros.statusRegistro]
  );

  return {
    ocupacoes,
    carregando,
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
