/**
 * Publica as Security Rules do Firestore para o banco nomeado (mapa-de-calor).
 * Não altera regras de outros bancos.
 * Uso: node scripts/deploy-rules.cjs
 */

const fs = require('fs');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');

const PROJECT = 'gglobo-pea-hdg-prd';
const DATABASE_ID = 'mapa-de-calor';
const API = 'https://firebaserules.googleapis.com/v1';
const RULES_FILE = path.resolve(__dirname, '..', 'firestore.rules');
const KEY_PATH =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  'C:\\Projetos\\Hub de Paineis\\gglobo-pea-hdg-prd-7e245672146b.json';

async function getToken() {
  const key = JSON.parse(fs.readFileSync(KEY_PATH, 'utf8'));
  const auth = new GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const client = await auth.getClient();
  const t = await client.getAccessToken();
  if (!t.token) throw new Error('Não foi possível obter access token da service account.');
  return t.token;
}

async function api(token, url, options = {}) {
  const headers = {
    Authorization: `Bearer ${token}`,
    'x-goog-user-project': PROJECT,
    ...(options.headers || {}),
  };
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

async function main() {
  const token = await getToken();
  const content = fs.readFileSync(RULES_FILE, 'utf8');

  const ruleset = await api(token, `${API}/projects/${PROJECT}/rulesets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source: { files: [{ name: 'firestore.rules', content }] } }),
  });
  console.log('Ruleset criado:', ruleset.name);

  const releaseName = `projects/${PROJECT}/releases/cloud.firestore/${DATABASE_ID}`;
  try {
    const release = await api(token, `${API}/projects/${PROJECT}/releases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: releaseName, rulesetName: ruleset.name }),
    });
    console.log('Release criado:', release.name);
  } catch {
    const release = await api(token, `${API}/${releaseName}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ release: { name: releaseName, rulesetName: ruleset.name } }),
    });
    console.log('Release atualizado:', release.name);
  }

  console.log(`Regras publicadas para cloud.firestore/${DATABASE_ID}`);
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Falha ao publicar regras:', err.message || err);
    process.exit(1);
  });
