import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import * as logger from 'firebase-functions/logger';
import { setGlobalOptions } from 'firebase-functions/v2';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

setGlobalOptions({ region: 'southamerica-east1', maxInstances: 10 });

initializeApp();

const DB = 'mapa-de-calor';
const db = getFirestore(DB);
const auth = getAuth();

// Admin bootstrap fixo (imutável) para evitar lockout.
const BOOTSTRAP_ADMIN_UID = '7eWBP7WfzJYgEcsZ0UZFD5e9RfZ2'; // jose.slima@g.globo

// Campos auditáveis (ignora derivados semana/dia/mes e metadados de atribuição).
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

function ehAdmin(uid: string, role: string | undefined): boolean {
  return uid === BOOTSTRAP_ADMIN_UID || role === 'admin';
}

async function roleDoUsuario(uid: string): Promise<string | undefined> {
  const snap = await db.collection('usuarios').doc(uid).get();
  return snap.exists ? (snap.data()?.role as string | undefined) : undefined;
}

// ---------------------------------------------------------------------------
// 1) Auditoria de alterações em ocupacoes (UPDATE)
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
// 2) Espelhar role em custom claims (leitura rápida no frontend)
// ---------------------------------------------------------------------------
export const sincronizarClaims = onDocumentWritten(
  { document: 'usuarios/{uid}', database: DB },
  async event => {
    const uid = event.params.uid;
    const after = event.data?.after.exists ? event.data.after.data() : null;
    const role = after?.role ?? null;
    try {
      await auth.setCustomUserClaims(uid, role ? { role } : {});
    } catch (e) {
      logger.warn(`Falha ao sincronizar claims de ${uid}`, e);
    }
  }
);

// ---------------------------------------------------------------------------
// 3) Provisionar acesso no login (usuarios/{uid} + acessosPendentes)
// ---------------------------------------------------------------------------
export const sincronizarMeuAcesso = onCall(async request => {
  const ctx = request.auth;
  if (!ctx) throw new HttpsError('unauthenticated', 'Não autenticado.');

  const uid = ctx.uid;
  const email = String(ctx.token.email ?? '').toLowerCase();
  const nome = String(ctx.token.name ?? email);

  const ref = db.collection('usuarios').doc(uid);
  const snap = await ref.get();
  if (snap.exists) {
    return { role: snap.data()?.role ?? 'viewer' };
  }

  let role = 'viewer';
  const pendRef = db.collection('acessosPendentes').doc(email);
  const pend = await pendRef.get();
  if (pend.exists) {
    const r = pend.data()?.role;
    if (r === 'editor' || r === 'admin') role = r;
  }
  if (uid === BOOTSTRAP_ADMIN_UID) role = 'admin';

  await ref.set(
    {
      email,
      nome,
      role,
      ativo: true,
      atualizadoEm: FieldValue.serverTimestamp(),
      atualizadoPor: 'sistema',
    },
    { merge: true }
  );
  if (pend.exists) await pendRef.delete();
  await auth.setCustomUserClaims(uid, { role });
  return { role };
});

// ---------------------------------------------------------------------------
// 4) Definir papel (admin-only): adiciona/remove EDITOR
// ---------------------------------------------------------------------------
export const definirPapel = onCall(async request => {
  const ctx = request.auth;
  if (!ctx) throw new HttpsError('unauthenticated', 'Não autenticado.');

  const solicitanteUid = ctx.uid;
  const solicitanteEmail = String(ctx.token.email ?? '');
  const solicitanteRole = await roleDoUsuario(solicitanteUid);
  if (!ehAdmin(solicitanteUid, solicitanteRole)) {
    throw new HttpsError('permission-denied', 'Apenas administradores.');
  }

  const dados = (request.data ?? {}) as { email?: string; role?: string };
  const email = String(dados.email ?? '').trim().toLowerCase();
  const role = String(dados.role ?? '').trim();
  if (!email || !['editor', 'viewer'].includes(role)) {
    throw new HttpsError('invalid-argument', 'E-mail ou papel inválido.');
  }

  let uid: string | null = null;
  try {
    const u = await auth.getUserByEmail(email);
    uid = u.uid;
  } catch {
    uid = null;
  }

  const acao = role === 'editor' ? 'EDITOR_ADICIONADO' : 'EDITOR_REMOVIDO';

  if (uid) {
    await db.collection('usuarios').doc(uid).set(
      {
        email,
        role,
        atualizadoEm: FieldValue.serverTimestamp(),
        atualizadoPor: solicitanteEmail,
      },
      { merge: true }
    );
    await auth.setCustomUserClaims(uid, { role });
    await db.collection('acessosPendentes').doc(email).delete().catch(() => undefined);
  } else {
    await db.collection('acessosPendentes').doc(email).set(
      {
        role,
        criadoPor: solicitanteEmail,
        criadoEm: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  await db.collection('historicoAcessos').add({
    acao,
    usuarioAfetado: email,
    executadoPor: solicitanteEmail,
    executadoPorUid: solicitanteUid,
    executadoEm: FieldValue.serverTimestamp(),
    pendente: !uid,
  });

  return { ok: true, uid, pendente: !uid };
});
