import { useState, useEffect } from 'react';
import type { DiaCalculated, User, Ocupacao, ViewMode, StatusRegistro } from '../types';
import { formatDataExtenso, getNomeMes } from '../utils/dateUtils';
import { formatPercent, TIPOS_OPCOES } from '../config/heatmapConfig';
import { getWeekNumber, getWeekday } from '../utils/weekNumber';
import { agruparConteudosPorDia, calcularPercentual } from '../utils/calculations';
import { Legend } from './Legend';

interface DrawerProps {
  dia: DiaCalculated | null;
  user: User;
  viewMode: ViewMode;
  onClose: () => void;
  onSave: (registro: Ocupacao) => void;
}

const DIAS_SEMANA_LABEL = ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

const formatNumero = (n: number) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function Drawer({ dia, user, viewMode, onClose, onSave }: DrawerProps) {
  const [tab, setTab] = useState<'resumo' | 'registros'>('resumo');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Ocupacao | null>(null);
  const isEditor = user.role === 'editor';

  useEffect(() => {
    setTab('resumo');
    setEditingId(null);
    setForm(null);
  }, [dia?.data]);

  if (!dia) return null;

  const abrirRegistro = (registro: Ocupacao) => {
    setEditingId(registro.id);
    setForm({ ...registro });
  };

  const voltarLista = () => {
    setEditingId(null);
    setForm(null);
  };

  const handleSave = () => {
    if (!form) return;
    onSave({
      ...form,
      novaColunaOrcada: Number(form.novaColunaOrcada) || 0,
      hora2: form.hora2 === null ? null : Number(form.hora2),
      horaOrcada: form.horaOrcada === null ? null : Number(form.horaOrcada),
    });
    voltarLista();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              Semana {dia.semana} · {DIAS_SEMANA_LABEL[dia.diaSemana]}
            </p>
            <h2 className="text-lg font-semibold text-gray-900">{formatDataExtenso(dia.data)}</h2>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            ✕
          </button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setTab('resumo')}
            className={`flex-1 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              tab === 'resumo'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Resumo
          </button>
          <button
            onClick={() => setTab('registros')}
            className={`flex-1 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              tab === 'registros'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Registros ({dia.registros.length})
          </button>
        </div>

        {tab === 'resumo' ? (
          <AbaResumo dia={dia} viewMode={viewMode} />
        ) : editingId && form ? (
          <FichaRegistro
            form={form}
            isEditor={isEditor}
            onChange={setForm}
            onVoltar={voltarLista}
            onCancelar={voltarLista}
            onSalvar={handleSave}
          />
        ) : (
          <ListaRegistros dia={dia} isEditor={isEditor} onAbrir={abrirRegistro} />
        )}

        {/* Rodapé */}
        {tab === 'resumo' && (
          <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
            <button
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Fechar
            </button>
            <button
              onClick={() => setTab('registros')}
              className="flex items-center gap-2 rounded-md bg-corporate-900 px-4 py-2 text-sm font-medium text-white hover:bg-corporate-800"
            >
              Ver todos os registros
              <span aria-hidden>→</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function AbaResumo({ dia, viewMode }: { dia: DiaCalculated; viewMode: ViewMode }) {
  const conteudos = agruparConteudosPorDia(dia);
  const exibidos = viewMode === 'detalhada' ? conteudos : conteudos.slice(0, 5);
  const restantes = conteudos.slice(5);
  const totalOutros = restantes.reduce((s, c) => s + c.total, 0);

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
      <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-500">
          Ocupação total do dia
        </p>
        <p className="mt-0.5 text-2xl font-bold text-blue-900">
          {formatPercent(dia.percentual)}
          <span className="ml-2 align-middle text-xs font-medium text-blue-500">
            ({formatNumero(dia.total)} / 102)
          </span>
        </p>
      </div>

      <h3 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wider text-gray-500">
        Composição por projeto
      </h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-wider text-gray-400">
            <th className="pb-1.5 font-semibold">Projeto / Conteúdo</th>
            <th className="pb-1.5 text-right font-semibold">Total</th>
            <th className="pb-1.5 text-right font-semibold">%</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {exibidos.map(c => (
            <tr key={c.projeto}>
              <td className="py-1.5 pr-3 text-gray-700">
                <span className="line-clamp-1" title={c.projeto}>{c.projeto}</span>
              </td>
              <td className="py-1.5 pr-3 text-right tabular-nums text-gray-600">{formatNumero(c.total)}</td>
              <td className="py-1.5 text-right font-medium tabular-nums text-gray-800">
                {formatPercent(c.percentual)}
              </td>
            </tr>
          ))}
          {viewMode !== 'detalhada' && restantes.length > 0 && (
            <tr>
              <td className="py-1.5 pr-3 text-gray-500">OUTROS ({restantes.length})</td>
              <td className="py-1.5 pr-3 text-right tabular-nums text-gray-600">{formatNumero(totalOutros)}</td>
              <td className="py-1.5 text-right font-medium tabular-nums text-gray-800">
                {formatPercent(calcularPercentual(totalOutros))}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="mt-5 border-t border-gray-100 pt-4">
        <Legend />
      </div>
    </div>
  );
}

function ListaRegistros({
  dia,
  isEditor,
  onAbrir,
}: {
  dia: DiaCalculated;
  isEditor: boolean;
  onAbrir: (registro: Ocupacao) => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
      <ul className="space-y-1.5">
        {dia.registros.map((r, index) => (
          <li
            key={r.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2 hover:border-gray-200"
          >
            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                Registro {index + 1}
              </p>
              <p className="truncate text-sm font-medium text-gray-800" title={r.projeto}>
                {r.projeto || '(sem projeto)'}
              </p>
              <p className="flex items-center gap-2 text-[11px] text-gray-500">
                <span>{r.tipo} · {formatNumero(r.novaColunaOrcada)}</span>
                {r.statusRegistro === 'INATIVO' && (
                  <span className="rounded bg-gray-200 px-1 py-0.5 text-[9px] font-semibold uppercase text-gray-600">
                    Inativo
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => onAbrir(r)}
              className="shrink-0 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              {isEditor ? 'Editar' : 'Ver'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface FichaProps {
  form: Ocupacao;
  isEditor: boolean;
  onChange: (form: Ocupacao) => void;
  onVoltar: () => void;
  onCancelar: () => void;
  onSalvar: () => void;
}

function FichaRegistro({ form, isEditor, onChange, onVoltar, onCancelar, onSalvar }: FichaProps) {
  const set = <K extends keyof Ocupacao>(key: K, value: Ocupacao[K]) => {
    onChange({ ...form, [key]: value });
  };

  const semanaPreview = form.data ? getWeekNumber(form.data) : '';
  const diaPreview = form.data ? DIAS_SEMANA_LABEL[getWeekday(form.data)] : '';
  const mesPreview = form.data ? getNomeMes(form.data) : '';

  const inputClass =
    'w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500';

  return (
    <>
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-2.5">
        <button onClick={onVoltar} className="text-sm font-medium text-blue-600 hover:text-blue-700">
          ← Voltar aos registros
        </button>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          {isEditor ? 'Editar registro' : 'Detalhes do registro'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
        <div className="space-y-3.5">
          <Field label="DATA">
            <input type="date" disabled={!isEditor} value={form.data} onChange={e => set('data', e.target.value)} className={inputClass} />
          </Field>
          <Field label="DT_HR_INICIO_RECURSO">
            <input type="datetime-local" disabled={!isEditor} value={form.dtHrInicioRecurso} onChange={e => set('dtHrInicioRecurso', e.target.value)} className={inputClass} />
          </Field>
          <Field label="DT_HR_FIM_RECURSO">
            <input type="datetime-local" disabled={!isEditor} value={form.dtHrFimRecurso} onChange={e => set('dtHrFimRecurso', e.target.value)} className={inputClass} />
          </Field>
          <Field label="PROJETO / CONTEÚDO">
            <input type="text" disabled={!isEditor} value={form.projeto} onChange={e => set('projeto', e.target.value)} className={inputClass} />
          </Field>
          <Field label="TIPO">
            <select disabled={!isEditor} value={form.tipo} onChange={e => set('tipo', e.target.value)} className={inputClass}>
              {!TIPOS_OPCOES.includes(form.tipo) && form.tipo && <option value={form.tipo}>{form.tipo}</option>}
              {TIPOS_OPCOES.filter(t => t !== 'TODOS').map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="NM_RECURSO">
            <input type="text" disabled={!isEditor} value={form.nmRecurso} onChange={e => set('nmRecurso', e.target.value)} className={inputClass} />
          </Field>
          <Field label="STATUS">
            <input type="text" disabled={!isEditor} value={form.status} onChange={e => set('status', e.target.value)} className={inputClass} />
          </Field>
          <Field label="STATUS DO REGISTRO">
            <select
              disabled={!isEditor}
              value={form.statusRegistro}
              onChange={e => set('statusRegistro', e.target.value as StatusRegistro)}
              className={inputClass}
            >
              <option value="ATIVO">ATIVO</option>
              <option value="INATIVO">INATIVO</option>
            </select>
          </Field>
          <Field label="TIPO2">
            <input type="text" disabled={!isEditor} value={form.tipo2} onChange={e => set('tipo2', e.target.value)} className={inputClass} />
          </Field>
          <Field label="SITE">
            <input type="text" disabled={!isEditor} value={form.site} onChange={e => set('site', e.target.value)} className={inputClass} />
          </Field>
          <Field label="HORA2">
            <input type="number" step="0.01" disabled={!isEditor} value={form.hora2 ?? ''} onChange={e => set('hora2', e.target.value === '' ? null : Number(e.target.value))} className={inputClass} />
          </Field>
          <Field label="HORA ORÇADA">
            <input type="number" step="0.01" disabled={!isEditor} value={form.horaOrcada ?? ''} onChange={e => set('horaOrcada', e.target.value === '' ? null : Number(e.target.value))} className={inputClass} />
          </Field>
          <Field label="NOVA COLUNA ORÇADA">
            <input type="number" step="0.01" disabled={!isEditor} value={form.novaColunaOrcada} onChange={e => set('novaColunaOrcada', Number(e.target.value))} className={inputClass} />
          </Field>

          <div className="rounded-lg bg-gray-50 p-3">
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-gray-400">
              Campos recalculados automaticamente
            </p>
            <div className="grid grid-cols-4 gap-2 text-xs text-gray-600">
              <div>
                <span className="block text-[9px] uppercase text-gray-400">ID</span>
                <span className="block truncate">{form.idPlanilha || '—'}</span>
              </div>
              <div>
                <span className="block text-[9px] uppercase text-gray-400">Semana</span>
                <span>{semanaPreview}</span>
              </div>
              <div>
                <span className="block text-[9px] uppercase text-gray-400">Dia</span>
                <span>{diaPreview}</span>
              </div>
              <div>
                <span className="block text-[9px] uppercase text-gray-400">Mês</span>
                <span>{mesPreview}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 px-5 py-4">
        <div className="flex justify-end gap-3">
          <button onClick={onCancelar} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancelar
          </button>
          {isEditor && (
            <button onClick={onSalvar} className="rounded-md bg-corporate-900 px-4 py-2 text-sm font-medium text-white hover:bg-corporate-800">
              Salvar alterações
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[9px] font-semibold uppercase tracking-wider text-gray-500">{label}</label>
      {children}
    </div>
  );
}
