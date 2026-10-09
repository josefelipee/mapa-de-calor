/**
 * Importa os registros de src/data/ocupacoes.json para o Firestore (banco nomeado).
 * Uso: node scripts/import-ocupacoes.cjs
 * Requer a chave de serviço em GOOGLE_APPLICATION_CREDENTIALS ou no caminho padrão abaixo.
 */

const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const PROJECT_ID = 'gglobo-pea-hdg-prd';
const DATABASE_ID = 'mapa-de-calor';
const COLLECTION = 'ocupacoes';

const keyPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  'C:\\Projetos\\Hub de Paineis\\gglobo-pea-hdg-prd-7e245672146b.json';

const dataPath = path.resolve(__dirname, '..', 'src', 'data', 'ocupacoes.json');

async function main() {
  if (!fs.existsSync(keyPath)) {
    throw new Error(`Chave de serviço não encontrada em: ${keyPath}`);
  }
  initializeApp({
    credential: cert(JSON.parse(fs.readFileSync(keyPath, 'utf8'))),
    projectId: PROJECT_ID,
  });

  const db = getFirestore(DATABASE_ID);
  const registros = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  console.log(`Lidos ${registros.length} registros de ${dataPath}`);

  const batchSize = 400;
  let total = 0;
  for (let i = 0; i < registros.length; i += batchSize) {
    const batch = db.batch();
    const slice = registros.slice(i, i + batchSize);
    for (const r of slice) {
      if (!r || !r.id) continue;
      const { id, ...campos } = r;
      batch.set(db.collection(COLLECTION).doc(id), {
        ...campos,
        statusRegistro: campos.statusRegistro === 'INATIVO' ? 'INATIVO' : 'ATIVO',
      });
    }
    await batch.commit();
    total += slice.length;
    console.log(`  enviados ${total}/${registros.length}`);
  }

  console.log(`Concluído: ${total} registros em ${DATABASE_ID}/${COLLECTION}.`);
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Falha na importação:', err.message || err);
    process.exit(1);
  });
