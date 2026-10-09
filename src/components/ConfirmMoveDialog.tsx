import { formatDataBR } from '../utils/dateUtils';

interface ConfirmMoveDialogProps {
  projeto: string;
  origem: string;
  destino: string;
  quantidade: number;
  onCancelar: () => void;
  onConfirmar: () => void;
}

export function ConfirmMoveDialog({
  projeto,
  origem,
  destino,
  quantidade,
  onCancelar,
  onConfirmar,
}: ConfirmMoveDialogProps) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/30 p-4" onClick={onCancelar}>
      <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Mover alocação</p>
        <p className="mt-1 text-base font-semibold text-gray-900">{projeto}</p>

        <div className="mt-3 space-y-1.5 text-sm text-gray-600">
          <p>
            De: <span className="font-medium text-gray-900">{formatDataBR(origem)}</span>
          </p>
          <p>
            Para: <span className="font-medium text-gray-900">{formatDataBR(destino)}</span>
          </p>
          <p>
            Registros afetados: <span className="font-semibold text-gray-900">{quantidade}</span>
          </p>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onCancelar}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="rounded-md bg-corporate-900 px-4 py-2 text-sm font-medium text-white hover:bg-corporate-800"
          >
            Mover
          </button>
        </div>
      </div>
    </div>
  );
}
