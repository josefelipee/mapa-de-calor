const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const excelPath = 'C:\\Projetos\\mapa de calor\\Controles ION 2027.xlsx';
const tempBase = 'C:\\Users\\jofelipe\\AppData\\Local\\Temp\\opencode\\xlsx_inspect';
const outputPath = 'C:\\Projetos\\mapa de calor\\src\\data\\ocupacoes.json';

// Re-extract xlsx if needed
function ensureExtracted() {
  if (!fs.existsSync(path.join(tempBase, 'xl', 'worksheets', 'sheet2.xml'))) {
    const admZip = require('adm-zip');
    const zip = new admZip(excelPath);
    zip.extractAllTo(tempBase, true);
  }
}

// Use powershell Expand-Archive since adm-zip may not be installed
function extractWithPowerShell() {
  if (fs.existsSync(path.join(tempBase, 'xl', 'worksheets', 'sheet2.xml'))) return;
  if (fs.existsSync(tempBase)) {
    fs.rmSync(tempBase, { recursive: true, force: true });
  }
  fs.mkdirSync(tempBase, { recursive: true });
  const zipPath = path.join(tempBase, 'temp.zip');
  fs.copyFileSync(excelPath, zipPath);
  const { execSync } = require('child_process');
  execSync(`powershell -Command "Expand-Archive -LiteralPath '${zipPath}' -DestinationPath '${tempBase}'"`);
}

extractWithPowerShell();

const sheetPath = path.join(tempBase, 'xl', 'worksheets', 'sheet2.xml');
const stringsPath = path.join(tempBase, 'xl', 'sharedStrings.xml');

function parseSharedStrings(xml) {
  const si = xml.match(/<si[^>]*>([\s\S]*?)<\/si>/g) || [];
  return si.map(item => {
    const texts = item.match(/<t[^>]*>([^<]*)<\/t>/g) || [];
    return texts.map(t => t.replace(/<[^>]+>/g, '')).join('');
  });
}

function parseTableRows(xml, shared) {
  const rows = [];
  const rowMatches = xml.match(/<row[^>]*>([\s\S]*?)<\/row>/g) || [];
  for (const rowStr of rowMatches) {
    const cells = [];
    const cellMatches = rowStr.match(/<c[^>]*>([\s\S]*?)<\/c>/g) || [];
    for (const cell of cellMatches) {
      const typeMatch = cell.match(/t="([^"]+)"/);
      const valMatch = cell.match(/<v>([^<]*)<\/v>/);
      let value = null;
      if (valMatch) {
        value = valMatch[1];
        if (typeMatch && typeMatch[1] === 's') {
          value = shared[parseInt(value, 10)] || '';
        } else if (/^-?\d+(\.\d+)?$/.test(value)) {
          value = parseFloat(value);
        }
      }
      cells.push(value);
    }
    rows.push(cells);
  }
  return rows;
}

function excelSerialToDate(serial) {
  // Excel base date is 1899-12-30. Use noon UTC to avoid timezone issues.
  const base = new Date(Date.UTC(1899, 11, 30, 12, 0, 0));
  const date = new Date(base.getTime() + serial * 24 * 60 * 60 * 1000);
  return date;
}

function formatDate(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseData(value) {
  if (typeof value === 'number') {
    const date = excelSerialToDate(value);
    return formatDate(date);
  }
  if (typeof value === 'string') {
    const [d, m, y] = value.split('/').map(Number);
    if (d && m && y) {
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }
  return null;
}

const stringsXml = fs.readFileSync(stringsPath, 'utf8');
const shared = parseSharedStrings(stringsXml);
const sheetXml = fs.readFileSync(sheetPath, 'utf8');
const allRows = parseTableRows(sheetXml, shared);

const header = allRows[0];
const dataIdx = header.indexOf('DATA');
const projetoIdx = header.indexOf('DS_PROJETO_ENGENHARIA_PROJETO_PRODUTO');
const tipoIdx = header.indexOf('Tipo');
const valorIdx = header.indexOf('Nova Coluna Orçada');

const ocupacoes = [];
let invalidCount = 0;

for (let i = 1; i < allRows.length; i++) {
  const row = allRows[i];
  const data = parseData(row[dataIdx]);
  const projeto = row[projetoIdx];
  const tipo = row[tipoIdx];
  const valor = row[valorIdx];

  if (!data || !projeto || typeof valor !== 'number' || isNaN(valor)) {
    invalidCount++;
    continue;
  }

  ocupacoes.push({
    id: uuidv4(),
    data,
    projeto: String(projeto).trim(),
    tipo: String(tipo || 'SEM CONTROLE').trim(),
    valor,
  });
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(ocupacoes, null, 2));

console.log('Total de registros:', ocupacoes.length);
console.log('Registros ignorados:', invalidCount);

// Validação 31/07/2027
const jul31 = ocupacoes.filter(o => o.data === '2027-07-31');
const total = jul31.reduce((s, o) => s + o.valor, 0);
console.log('31/07/2027 registros:', jul31.length, 'total:', total, 'percentual:', (total / 102 * 100).toFixed(1) + '%');

// Tipos únicos
const tipos = {};
for (const o of ocupacoes) {
  tipos[o.tipo] = (tipos[o.tipo] || 0) + 1;
}
console.log('Tipos:', tipos);
