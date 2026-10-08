import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useOcupacoes } from './hooks/useOcupacoes';
import { Login } from './components/Login';
import { Header } from './components/Header';
import { Filters } from './components/Filters';
import { Heatmap } from './components/Heatmap';
import { WeekBars } from './components/WeekBars';
import { Legend } from './components/Legend';
import { Drawer } from './components/Drawer';
import type { Filtros, ViewMode } from './types';

const FILTROS_INICIAIS: Filtros = {
  dataInicial: '2027-01-01',
  dataFinal: '2027-12-31',
  tipo: 'TODOS',
  projeto: 'TODOS',
};

function App() {
  const { user, login, logout } = useAuth();
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIAIS);
  const [viewMode, setViewMode] = useState<ViewMode>('macro');
  const { dias, semanas, semanasNoIntervalo, projetosDisponiveis, atualizarRegistro, restaurar } =
    useOcupacoes(filtros);
  const [selectedData, setSelectedData] = useState<string | null>(null);
  const [semanaSelecionada, setSemanaSelecionada] = useState<number | null>(null);

  if (!user) {
    return <Login onLogin={login} />;
  }

  const diaSelecionado = selectedData ? dias.get(selectedData) ?? null : null;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header user={user} onLogout={logout} />

      <main className="flex-1 px-4 py-3">
        <Filters
          filtros={filtros}
          onChange={setFiltros}
          onRestaurar={() => {
            if (confirm('Deseja restaurar os dados originais? Todas as alterações locais serão perdidas.')) {
              restaurar();
            }
          }}
          projetosDisponiveis={projetosDisponiveis}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <div className="mt-2 flex justify-end">
          <Legend compact />
        </div>

        <div className="mt-2 flex gap-3">
          <WeekBars
            semanasNoIntervalo={semanasNoIntervalo}
            semanas={semanas}
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
    </div>
  );
}

export default App;
