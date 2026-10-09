import { useState } from 'react';
import type { DragEvent } from 'react';
import { useAuth } from './hooks/useAuth';
import { useOcupacoes } from './hooks/useOcupacoes';
import { Login } from './components/Login';
import { Header } from './components/Header';
import { Filters } from './components/Filters';
import { Heatmap } from './components/Heatmap';
import { WeekBars } from './components/WeekBars';
import { Legend } from './components/Legend';
import { Drawer } from './components/Drawer';
import { ConfirmMoveDialog } from './components/ConfirmMoveDialog';
import { exportarExcel, nomeArquivoExcel } from './services/export';
import type { Filtros, ViewMode } from './types';

const FILTROS_INICIAIS: Filtros = {
  dataInicial: '2027-01-01',
  dataFinal: '2027-12-31',
  tiposSelectionMode: 'all',
  selectedTipos: [],
  selectionMode: 'all',
  selectedProjects: [],
  statusRegistro: 'ATIVO',
};

interface DragState {
  origem: string;
  projeto: string;
}

interface ConfirmState {
  origem: string;
  destino: string;
  projeto: string;
  qtd: number;
}

function TelaCarregando({ texto }: { texto: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-corporate-950 text-blue-100">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-300/40 border-t-blue-300" />
      <p className="text-sm">{texto}</p>
    </div>
  );
}

function App() {
  const { user, carregando: carregandoAuth, erro, login, logout } = useAuth();
  const [entrando, setEntrando] = useState(false);
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIAIS);
  const [viewMode, setViewMode] = useState<ViewMode>('macro');
  const [exportando, setExportando] = useState(false);
  const {
    ocupacoes,
    carregando: carregandoDados,
    dias,
    semanas,
    metricasSemanais,
    projetosDisponiveis,
    totalRegistros,
    atualizarRegistro,
    contarMoviveis,
    moverAlocacao,
  } = useOcupacoes(filtros);
  const [selectedData, setSelectedData] = useState<string | null>(null);
  const [semanaSelecionada, setSemanaSelecionada] = useState<number | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [alvo, setAlvo] = useState<string | null>(null);
  const [movimento, setMovimento] = useState<ConfirmState | null>(null);

  if (carregandoAuth) {
    return <TelaCarregando texto="Verificando sessão..." />;
  }

  if (!user) {
    return (
      <Login
        onLogin={async () => {
          setEntrando(true);
          try {
            await login();
          } finally {
            setEntrando(false);
          }
        }}
        carregando={entrando}
        erro={erro}
      />
    );
  }

  if (carregandoDados) {
    return <TelaCarregando texto="Carregando dados..." />;
  }

  const diaSelecionado = selectedData ? dias.get(selectedData) ?? null : null;

  const dragHabilitado =
    user.role === 'editor' && filtros.selectionMode === 'custom' && filtros.selectedProjects.length === 1;
  const projetoSelecionado = dragHabilitado ? filtros.selectedProjects[0] : null;

  const handleExportar = async () => {
    setExportando(true);
    try {
      await exportarExcel(ocupacoes, nomeArquivoExcel(ocupacoes));
    } finally {
      setExportando(false);
    }
  };

  const onDragStart = (dataCelula: string, e: DragEvent) => {
    if (!dragHabilitado || !projetoSelecionado) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dataCelula);
    setDrag({ origem: dataCelula, projeto: projetoSelecionado });
    setAlvo(null);
  };

  const onDragOver = (dataCelula: string, e: DragEvent) => {
    if (!drag) return;
    if (dataCelula === drag.origem) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (alvo !== dataCelula) setAlvo(dataCelula);
  };

  const onDrop = (dataCelula: string, e: DragEvent) => {
    e.preventDefault();
    if (!drag) return;
    if (dataCelula !== drag.origem) {
      const qtd = contarMoviveis(drag.origem, drag.projeto);
      if (qtd > 0) {
        setMovimento({ origem: drag.origem, destino: dataCelula, projeto: drag.projeto, qtd });
      }
    }
    setDrag(null);
    setAlvo(null);
  };

  const onDragEnd = () => {
    setDrag(null);
    setAlvo(null);
  };

  const dragConfig = {
    habilitado: dragHabilitado,
    arrastando: drag !== null,
    origem: drag?.origem ?? null,
    alvo,
    onStart: onDragStart,
    onOver: onDragOver,
    onDrop,
    onEnd: onDragEnd,
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header user={user} onLogout={logout} />

      <main className="flex-1 px-4 py-3">
        <Filters
          filtros={filtros}
          onChange={setFiltros}
          onExportar={handleExportar}
          exportando={exportando}
          projetosDisponiveis={projetosDisponiveis}
          totalRegistros={totalRegistros}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <div className="mt-2 flex justify-end">
          <Legend compact />
        </div>

        <div className="mt-2 flex gap-3">
          <WeekBars
            metricas={metricasSemanais}
            semanaSelecionada={semanaSelecionada}
            onSemanaClick={semana =>
              setSemanaSelecionada(prev => (prev === semana ? null : semana))
            }
          />
          <div className="min-w-0 flex-1">
            <Heatmap
              semanas={semanas}
              onCellClick={dia => setSelectedData(dia.data)}
              viewMode={viewMode}
              semanaSelecionada={semanaSelecionada}
              drag={dragConfig}
            />
          </div>
        </div>
      </main>

      <Drawer
        dia={diaSelecionado}
        user={user}
        viewMode={viewMode}
        onClose={() => setSelectedData(null)}
        onSave={atualizarRegistro}
      />

      {movimento && (
        <ConfirmMoveDialog
          projeto={movimento.projeto}
          origem={movimento.origem}
          destino={movimento.destino}
          quantidade={movimento.qtd}
          onCancelar={() => setMovimento(null)}
          onConfirmar={() => {
            moverAlocacao(movimento.origem, movimento.destino, movimento.projeto);
            setMovimento(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
