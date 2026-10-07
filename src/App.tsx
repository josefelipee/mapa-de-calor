import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useOcupacoes } from './hooks/useOcupacoes';
import { Login } from './components/Login';
import { Header } from './components/Header';
import { Filters } from './components/Filters';
import { Heatmap } from './components/Heatmap';
import { Drawer } from './components/Drawer';
import type { DiaCalculated, Filtros } from './types';

const FILTROS_INICIAIS: Filtros = {
  dataInicial: '2027-01-01',
  dataFinal: '2027-12-31',
  tipo: 'TODOS',
};

function App() {
  const { user, login, logout } = useAuth();
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIAIS);
  const { semanas, atualizarOcupacao, restaurar } = useOcupacoes(filtros);
  const [selectedDia, setSelectedDia] = useState<DiaCalculated | null>(null);

  if (!user) {
    return <Login onLogin={login} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header user={user} onLogout={logout} />

      <main className="flex-1 px-4 py-5 lg:px-6">
        <Filters
          filtros={filtros}
          onChange={setFiltros}
          onRestaurar={() => {
            if (confirm('Deseja restaurar os dados originais? Todas as alterações locais serão perdidas.')) {
              restaurar();
            }
          }}
        />

        <div className="mt-5">
          <Heatmap semanas={semanas} onCellClick={setSelectedDia} />
        </div>
      </main>

      <Drawer
        dia={selectedDia}
        user={user}
        onClose={() => setSelectedDia(null)}
        onSave={(id, novoValor) => {
          atualizarOcupacao(id, novoValor);
        }}
      />
    </div>
  );
}

export default App;
