const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const excelPath = 'C:\\Projetos\\mapa de calor\\Controles ION 2027.xlsx';
const tempBase = 'C:\\Users\\jofelipe\\AppData\\Local\\Temp\\opencode\\xlsx_inspect';
const outputPath = 'C:\\Projetos\\mapa de calor\\src\\data\\ocupacoes.json';

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function extractWithPowerShell() {
  if (fs.existsSync(path.join(tempBase, 'xl', 'worksheets', 'sheet2.xml'))) return;
  if (fs.existsSync(tempBase)) fs.rmSync(tempBase, { recursive: true, force: true });
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
        if (typeMatch && typeMatch[1] === 's') value = shared[parseInt(value, 10)] || '';
        else if (/^-?\d+(\.\d+)?$/.test(value)) value = parseFloat(value);
      }
      cells.push(value);
    }
    rows.push(cells);
  }
  return rows;
}

const pad = n => String(n).padStart(2, '0');

function excelSerialToDateTime(serial) {
  if (typeof serial !== 'number') return serial == null ? '' : String(serial);
  const totalMinutes = Math.round(serial * 1440);
  const d = new Date(Date.UTC(1899, 11, 30, 0, 0, 0) + totalMinutes * 60000);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

function parseData(value) {
  if (typeof value === 'number') {
    const totalMinutes = Math.round(value * 1440);
    const d = new Date(Date.UTC(1899, 11, 30, 0, 0, 0) + totalMinutes * 60000);
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  }
  if (typeof value === 'string') {
    const [d, m, y] = value.split('/').map(Number);
    if (d && m && y) return `${y}-${pad(m)}-${pad(d)}`;
  }
  return null;
}

function dateFromISO(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

function getWeekday(date) {
  const jsDay = date.getUTCDay();
  return jsDay === 0 ? 7 : jsDay;
}

function getWeekStart(date) {
  const weekday = getWeekday(date);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - (weekday - 1), 12, 0, 0));
}

function getWeekNumber(date) {
  const year = date.getUTCFullYear();
  const firstDayOfYear = new Date(Date.UTC(year, 0, 1, 12, 0, 0));
  const firstWeekStart = getWeekStart(firstDayOfYear);
  const daysDiff = Math.floor((date.getTime() - firstWeekStart.getTime()) / 86400000);
  return Math.floor(daysDiff / 7) + 1;
}

const shared = parseSharedStrings(fs.readFileSync(stringsPath, 'utf8'));
const allRows = parseTableRows(fs.readFileSync(sheetPath, 'utf8'), shared);
const header = allRows[0];
const idx = name => header.indexOf(name);

const iInicio = idx('DT_HR_INICIO_RECURSO');
const iFim = idx('DT_HR_FIM_RECURSO');
const iProjeto = idx('DS_PROJETO_ENGENHARIA_PROJETO_PRODUTO');
const iTipo = idx('Tipo');
const iID = idx('ID');
const iNmRecurso = idx('NM_RECURSO');
const iStatus = idx('Status');
const iTipo2 = idx('Tipo2');
const iSite = idx('SITE');
const iData = idx('DATA');
const iHora2 = idx('Hora2');
const iHoraOrcada = idx('Hora Orçada');
const iNovaColuna = idx('Nova Coluna Orçada');

const ocupacoes = [];
let invalidCount = 0;

for (let i = 1; i < allRows.length; i++) {
  const row = allRows[i];
  const data = parseData(row[iData]);
  const valor = row[iNovaColuna];
  if (!data || typeof valor !== 'number' || isNaN(valor)) {
    invalidCount++;
    continue;
  }
  const dateObj = dateFromISO(data);
  ocupacoes.push({
    id: uuidv4(),
    dtHrInicioRecurso: excelSerialToDateTime(row[iInicio]),
    dtHrFimRecurso: excelSerialToDateTime(row[iFim]),
    semana: getWeekNumber(dateObj),
    dia: getWeekday(dateObj),
    mes: MESES[dateObj.getUTCMonth()],
    projeto: String(row[iProjeto] || '').trim(),
    tipo: String(row[iTipo] || 'SEM CONTROLE').trim(),
    idPlanilha: String(row[iID] || '').trim(),
    nmRecurso: String(row[iNmRecurso] || '').trim(),
    status: String(row[iStatus] || '').trim(),
    tipo2: String(row[iTipo2] || '').trim(),
    site: String(row[iSite] || '').trim(),
    data,
    hora2: typeof row[iHora2] === 'number' ? row[iHora2] : null,
    horaOrcada: typeof row[iHoraOrcada] === 'number' ? row[iHoraOrcada] : null,
    novaColunaOrcada: valor,
    statusRegistro: 'ATIVO',
  });
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(ocupacoes));

console.log('Total de registros:', ocupacoes.length);
console.log('Registros ignorados:', invalidCount);
console.log('Tamanho do arquivo:', (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2), 'MB');

const jul31 = ocupacoes.filter(o => o.data === '2027-07-31');
const total = jul31.reduce((s, o) => s + o.novaColunaOrcada, 0);
console.log('31/07/2027 registros:', jul31.length, 'total:', total, 'percentual:', (total / 102 * 100).toFixed(1) + '%');
console.log('Amostra:', JSON.stringify(ocupacoes.find(o => o.data === '2027-07-31'), null, 2));
