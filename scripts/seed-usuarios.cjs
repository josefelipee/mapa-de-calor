/**
 * Migra os usuários do Auth para a coleção usuarios + sincroniza custom claims.
 * - jose.slima@g.globo -> admin
 * - ffsampaio@g.globo  -> editor
 * - flemos@g.globo     -> editor
 * - demais             -> viewer
 * Uso: node scripts/seed-usuarios.cjs
 */

const fs = require('fs');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

const PROJECT_ID = 'gglobo-pea-hdg-prd';
const DATABASE_ID = 'mapa-de-calor';

const keyPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  'C:\\Projetos\\Hub de Paineis\\gglobo-pea-hdg-prd-7e245672146b.json';

const PERFIS = {
  'jose.slima@g.globo': 'admin',
  'ffsampaio@g.globo': 'editor',
  'flemos@g.globo': 'editor',
};

async function main() {
  if (!fs.existsSync(keyPath)) throw new Error(`Chave de serviço não encontrada: ${keyPath}`);

  initializeApp({
    credential: cert(JSON.parse(fs.readFileSync(keyPath, 'utf8'))),
    projectId: PROJECT_ID,
  });
  const db = getFirestore(DATABASE_ID);
  const auth = getAuth();

  let page = await auth.listUsers(1000);
  const usuarios = [...page.users];
  while (page.pageToken) {
    page = await auth.listUsers(1000, page.pageToken);
    usuarios.push(...page.users);
  }
  console.log(`Usuários no Auth: ${usuarios.length}`);

  for (const u of usuarios) {
    const email = (u.email || '').toLowerCase();
    const role = PERFIS[email] || 'viewer';
    await db.collection('usuarios').doc(u.uid).set(
      {
        email,
        nome: u.displayName || email,
        role,
        ativo: true,
        atualizadoEm: FieldValue.serverTimestamp(),
        atualizadoPor: 'seed',
      },
      { merge: true }
    );
    await auth.setCustomUserClaims(u.uid, { role });
    console.log(`  ${email} -> ${role}`);
  }

  console.log('Concluído.');
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Falha no seed:', err.message || err);
    process.exit(1);
  });
