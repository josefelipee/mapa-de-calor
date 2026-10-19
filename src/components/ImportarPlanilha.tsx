import { useRef, useState } from 'react';
import type { Ocupacao } from '../types';
import { montarAtualizacoes, parsePlanilha, type ResultadoMerge } from '../services/import/parsePlanilha';

interface ImportarPlanilhaProps {
  ocupacoes: Ocupacao[];
  onAplicar: (registros: Ocupacao[]) => void;
  onClose: () => void;
}

export function ImportarPlanilha({ ocupacoes, onAplicar, onClose }: ImportarPlanilhaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [resultado, setResultado] = useState<ResultadoMerge | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [processando, setProcessando] = useState(false);
  const [aplicado, setAplicado] = useState(0);
  const [nomeArquivo, setNomeArquivo] = useState('');

  const lerArquivo = async (file: File) => {
    setErro(null);
    setResultado(null);
    setAplicado(0);
    setNomeArquivo(file.name);
    setProcessando(true);
    try {
      const buffer = await file.arrayBuffer();
      const parsed = await parsePlanilha(buffer);
      if (parsed.erroGeral) {
        setErro(parsed.erroGeral);
        return;
      }
      setResultado(montarAtualizacoes(ocupacoes, parsed.linhas));
    } catch (e) {
      console.error('Falha ao ler planilha:', e);
      setErro('Não foi possível ler a planilha. Verifique se é um arquivo .xlsx válido.');
    } finally {
      setProcessando(false);
    }
  };

  const aplicar = () => {
    if (!resultado || resultado.atualizacoes.length === 0) return;
    onAplicar(resultado.atualizacoes);
    setAplicado(resultado.atualizacoes.length);
    setResultado(null);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Atualização em massa</p>
            <h2 className="text-lg font-semibold text-gray-900">Importar planilha</h2>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
          <p className="text-xs leading-relaxed text-gray-600">
            Envie a planilha <strong>no padrão exportado (19 colunas)</strong>. A correspondência é feita por{' '}
            <strong>ID_REGISTRO</strong>. As colunas mapeadas <strong>substituem</strong> os valores atuais do registro;
            Semana/Dia/Mês são recalculados. Linhas com ID não encontrado são ignoradas.
          </p>

          <div className="mt-4 flex items-center gap-3">
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) void lerArquivo(f);
                e.target.value = '';
              }}
            />
            <button
              onClick={() => inputRef.current?.click()}
              disabled={processando}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              Selecionar arquivo .xlsx
            </button>
            {nomeArquivo && <span className="truncate text-xs text-gray-500" title={nomeArquivo}>{nomeArquivo}</span>}
          </div>

          {processando && <p className="mt-4 text-xs text-gray-500">Lendo planilha…</p>}
          {erro && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{erro}</p>}

          {resultado && (
            <div className="mt-4 rounded-lg border border-gray-200 p-3 text-xs text-gray-700">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Prévia</p>
              <ul className="space-y-1">
                <li>Linhas lidas: <strong>{resultado.total}</strong></li>
                <li>Atualizações a aplicar: <strong>{resultado.atualizacoes.length}</strong></li>
                <li>Inalteradas: <strong>{resultado.inalterados}</strong></li>
                <li>ID não encontrado: <strong>{resultado.naoEncontrados.length}</strong></li>
                <li>Inválidas: <strong>{resultado.invalidas.length}</strong></li>
              </ul>
              {resultado.naoEncontrados.length > 0 && (
                <p className="mt-2 text-[11px] text-gray-500">
                  Linhas com ID não encontrado: {resultado.naoEncontrados.slice(0, 10).join(', ')}
                  {resultado.naoEncontrados.length > 10 ? '…' : ''}
                </p>
              )}
              {resultado.invalidas.length > 0 && (
                <p className="mt-1 text-[11px] text-gray-500">
                  Inválidas:{' '}
                  {resultado.invalidas
                    .slice(0, 5)
                    .map(i => `linha ${i.linha} (${i.erro})`)
                    .join('; ')}
                  {resultado.invalidas.length > 5 ? '…' : ''}
                </p>
              )}
            </div>
          )}

          {aplicado > 0 && (
            <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              {aplicado} atualização(ões) enviada(s). O mapa será atualizado automaticamente.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 px-5 py-4">
          <button onClick={onClose} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Fechar
          </button>
          <button
            onClick={aplicar}
            disabled={!resultado || resultado.atualizacoes.length === 0}
            className="rounded-md bg-corporate-900 px-4 py-2 text-sm font-medium text-white hover:bg-corporate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Aplicar atualizações
          </button>
        </div>
      </div>
    </div>
  );
}
