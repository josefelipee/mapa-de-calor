import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { setGlobalOptions } from 'firebase-functions/v2';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';

setGlobalOptions({ region: 'southamerica-east1', maxInstances: 10 });

const app = initializeApp();

const DB = 'mapa-de-calor';
const db = getFirestore(app, DB);

// Campos auditáveis de ocupacoes (ignora derivados semana/dia/mes e metadados de atribuição).
const CAMPOS_AUDITADOS = [
  'data',
  'novaColunaOrcada',
  'statusRegistro',
  'projeto',
  'tipo',
  'site',
  'dtHrInicioRecurso',
  'dtHrFimRecurso',
] as const;

// ---------------------------------------------------------------------------
// 1) Auditoria de alterações em ocupacoes (UPDATE) -> historicoAlteracoes
// ---------------------------------------------------------------------------
export const auditarOcupacao = onDocumentWritten(
  { document: 'ocupacoes/{id}', database: DB },
  async event => {
    const before = event.data?.before.exists ? event.data.before.data() : null;
    const after = event.data?.after.exists ? event.data.after.data() : null;
    if (!before || !after) return; // audita somente UPDATE

    const camposAlterados: { campo: string; anterior: unknown; novo: unknown }[] = [];
    for (const campo of CAMPOS_AUDITADOS) {
      const anterior = before[campo] ?? null;
      const novo = after[campo] ?? null;
      if (JSON.stringify(anterior) !== JSON.stringify(novo)) {
        camposAlterados.push({ campo, anterior, novo });
      }
    }
    if (camposAlterados.length === 0) return;

    await db.collection('historicoAlteracoes').add({
      ocupacaoId: event.params.id,
      acao: 'UPDATE',
      usuarioUid: after.atualizadoPorUid ?? null,
      usuarioEmail: after.atualizadoPor ?? null,
      alteradoEm: FieldValue.serverTimestamp(),
      operationId: after.ultimaOperacaoId ?? null,
      camposAlterados,
    });
  }
);

// ---------------------------------------------------------------------------
// 2) Auditoria de perfil em usuarios (mudança real) -> historicoAcessos
// ---------------------------------------------------------------------------
export const auditarAcesso = onDocumentWritten(
  { document: 'usuarios/{uid}', database: DB },
  async event => {
    const before = event.data?.before.exists ? event.data.before.data() : null;
    const after = event.data?.after.exists ? event.data.after.data() : null;
    if (!before || !after) return; // ignora criação/remoção
    if (before.perfil === after.perfil) return; // só mudança real de perfil

    await db.collection('historicoAcessos').add({
      usuarioAfetado: after.email ?? null,
      usuarioUid: event.params.uid,
      perfilAnterior: before.perfil ?? null,
      perfilNovo: after.perfil ?? null,
      executadoPor: after.atualizadoPor ?? null,
      executadoPorUid: after.atualizadoPorUid ?? null,
      executadoEm: FieldValue.serverTimestamp(),
    });
  }
);
