/**
 * Deploy do Firebase Hosting via API REST (usa o token do gcloud).
 * Publica a pasta dist/ no site mapa-de-calor.
 * Uso: node scripts/deploy-hosting.cjs
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const { execSync } = require('child_process');

const PROJECT = 'gglobo-pea-hdg-prd';
const SITE = 'mapa-de-calor';
const PUBLIC_DIR = path.resolve(__dirname, '..', 'dist');
const API = 'https://firebasehosting.googleapis.com/v1beta1';

function getToken() {
  return execSync('gcloud auth print-access-token', { encoding: 'utf8' }).trim();
}

function walk(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results = results.concat(walk(full));
    else results.push(full);
  }
  return results;
}

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
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
  if (!fs.existsSync(PUBLIC_DIR)) {
    throw new Error(`Pasta não encontrada: ${PUBLIC_DIR}. Rode "npm run build" antes.`);
  }
  const token = getToken();
  const files = walk(PUBLIC_DIR);
  const fileMap = {};
  const hashToBuffer = {};
  for (const f of files) {
    const rel = '/' + path.relative(PUBLIC_DIR, f).split(path.sep).join('/');
    const gz = zlib.gzipSync(fs.readFileSync(f));
    const h = sha256(gz);
    fileMap[rel] = h;
    hashToBuffer[h] = gz;
  }
  console.log(`Arquivos a publicar: ${files.length}`);

  const version = await api(token, `${API}/projects/${PROJECT}/sites/${SITE}/versions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config: {} }),
  });
  const versionName = version.name;
  console.log('Versão criada:', versionName);

  const pop = await api(token, `${API}/${versionName}:populateFiles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ files: fileMap }),
  });

  const required = pop.uploadRequiredHashes || [];
  console.log(`Arquivos a enviar: ${required.length}`);
  for (const h of required) {
    const gz = hashToBuffer[h];
    const res = await fetch(`${pop.uploadUrl}/${h}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/octet-stream' },
      body: gz,
    });
    if (!res.ok) throw new Error(`Upload falhou (${h}): ${res.status} ${await res.text()}`);
  }

  const versionId = versionName.split('/').pop();
  await api(token, `${API}/projects/${PROJECT}/sites/${SITE}/versions/${versionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'FINALIZED', config: {} }),
  });

  const release = await api(
    token,
    `${API}/projects/${PROJECT}/sites/${SITE}/releases?versionName=${encodeURIComponent(versionName)}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) }
  );

  console.log('Release:', release.name);
  console.log('Deploy concluído: https://' + SITE + '.web.app');
}

main().catch(e => {
  console.error('Falha no deploy:', e.message || e);
  process.exit(1);
});
