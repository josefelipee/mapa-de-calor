import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as logger from 'firebase-functions/logger';
import { setGlobalOptions } from 'firebase-functions/v2';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';

setGlobalOptions({ region: 'southamerica-east1', maxInstances: 10 });

const app = initializeApp();

const DB = 'mapa-de-calor';
const db = getFirestore(app, DB);

// Campos auditáveis de ocupacoes (inclui os campos importáveis da planilha).
const CAMPOS_AUDITADOS = [
  'data',
  'dtHrInicioRecurso',
  'dtHrFimRecurso',
  'projeto',
  'tipo',
  'idPlanilha',
  'nmRecurso',
  'status',
  'tipo2',
  'site',
  'canal',
  'hora2',
  'horaOrcada',
  'novaColunaOrcada',
  'statusRegistro',
] as const;

// Campos registrados na criação (valores iniciais relevantes).
const CAMPOS_CRIACAO = [
  'data',
  'dtHrInicioRecurso',
  'dtHrFimRecurso',
  'projeto',
  'tipo',
  'status',
  'statusRegistro',
  'site',
  'canal',
  'novaColunaOrcada',
] as const;

// ---------------------------------------------------------------------------
// 1) Auditoria de CREATE/UPDATE em ocupacoes -> historicoAlteracoes
// ---------------------------------------------------------------------------
export const auditarOcupacao = onDocumentWritten(
  { document: 'ocupacoes/{id}', database: DB },
  async event => {
    const before = event.data?.before.exists ? event.data.before.data() : null;
    const after = event.data?.after.exists ? event.data.after.data() : null;
    if (!after) return; // deleção não é auditada

    const acao = before ? 'UPDATE' : 'CREATE';
    const camposAlterados: { campo: string; anterior: unknown; novo: unknown }[] = [];

    if (before) {
      for (const campo of CAMPOS_AUDITADOS) {
        const anterior = before[campo] ?? null;
        const novo = after[campo] ?? null;
        if (JSON.stringify(anterior) !== JSON.stringify(novo)) {
          camposAlterados.push({ campo, anterior, novo });
        }
      }
    } else {
      for (const campo of CAMPOS_CRIACAO) {
        camposAlterados.push({ campo, anterior: null, novo: after[campo] ?? null });
      }
    }

    logger.info('auditarOcupacao', {
      eventId: event.id,
      ocupacaoId: event.params.id,
      acao,
      hasBefore: !!before,
      hasAfter: !!after,
      camposAlterados: camposAlterados.map(c => c.campo),
    });

    if (acao === 'UPDATE' && camposAlterados.length === 0) return;

    await db.collection('historicoAlteracoes').add({
      ocupacaoId: event.params.id,
      acao,
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

    const perfilAnterior = before?.perfil ?? null;
    const perfilNovo = after?.perfil ?? null;

    logger.info('auditarAcesso', {
      eventId: event.id,
      uid: event.params.uid,
      perfilAnterior,
      perfilNovo,
    });

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
