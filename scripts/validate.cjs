const fs = require('fs');
const path = require('path');

// --- Réplica exata da lógica em src/utils/weekNumber.ts ---
function parseData(dataStr) {
  const [y, m, d] = dataStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

function getWeekday(dateInput) {
  const date = typeof dateInput === 'string' ? parseData(dateInput) : dateInput;
  const jsDay = date.getUTCDay();
  return jsDay === 0 ? 7 : jsDay;
}

function getWeekStart(date) {
  const weekday = getWeekday(date);
  const diff = weekday - 1;
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - diff, 12, 0, 0));
}

function getWeekNumber(dateInput) {
  const date = typeof dateInput === 'string' ? parseData(dateInput) : dateInput;
  const year = date.getUTCFullYear();
  const firstDayOfYear = new Date(Date.UTC(year, 0, 1, 12, 0, 0));
  const firstWeekStart = getWeekStart(firstDayOfYear);
  const diff = date.getTime() - firstWeekStart.getTime();
  const daysDiff = Math.floor(diff / (24 * 60 * 60 * 1000));
  return Math.floor(daysDiff / 7) + 1;
}

const CAPACIDADE = 102;

let falhas = 0;

// --- Réplica da lógica de faixas em src/config/heatmapConfig.ts ---
const FAIXAS = [
  { max: 80, label: '0-80 (verde)' },
  { max: 100, label: '81-100 (amarelo)' },
  { max: 120, label: '101-120 (laranja)' },
  { max: Infinity, label: '>120 (vermelho)' },
];
function getFaixa(p) {
  const v = Math.round(p);
  return FAIXAS.find(f => v <= f.max);
}

console.log('=== Testes de faixas de cor ===');
const testesCor = [
  { p: 80, esperado: '0-80 (verde)' },
  { p: 85, esperado: '81-100 (amarelo)' },
  { p: 116, esperado: '101-120 (laranja)' },
  { p: 148, esperado: '>120 (vermelho)' },
  { p: 80.4, esperado: '0-80 (verde)' },
  { p: 80.5, esperado: '81-100 (amarelo)' },
  { p: 100.4, esperado: '81-100 (amarelo)' },
  { p: 100.5, esperado: '101-120 (laranja)' },
  { p: 120.5, esperado: '>120 (vermelho)' },
  { p: 0, esperado: '0-80 (verde)' },
];
for (const t of testesCor) {
  const obtido = getFaixa(t.p).label;
  const ok = obtido === t.esperado;
  if (!ok) falhas++;
  console.log(`${ok ? 'OK ' : 'FALHA'} ${t.p}% -> ${obtido} (esperado ${t.esperado})`);
}

console.log('\n=== Testes de WEEKNUM/WEEKDAY ===');
const testes = [
  { data: '2027-01-01', semana: 1, dia: 5 },
  { data: '2027-01-04', semana: 2, dia: 1 },
  { data: '2027-12-31', semana: 53, dia: 5 },
  { data: '2027-07-31', semana: 31, dia: 6 },
];

for (const t of testes) {
  const s = getWeekNumber(t.data);
  const d = getWeekday(t.data);
  const ok = s === t.semana && d === t.dia;
  if (!ok) falhas++;
  console.log(
    `${ok ? 'OK ' : 'FALHA'} ${t.data} -> semana ${s} (esperado ${t.semana}), dia ${d} (esperado ${t.dia})`
  );
}

console.log('\n=== Validação 31/07/2027 (base real) ===');
const jsonPath = path.join(__dirname, '..', 'src', 'data', 'ocupacoes.json');
const ocupacoes = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const jul31 = ocupacoes.filter(o => o.data === '2027-07-31');
const total = jul31.reduce((s, o) => s + o.novaColunaOrcada, 0);
console.log('Registros:', jul31.length);
console.log('Total:', total.toFixed(6), '(esperado 144.333333)');
console.log('Percentual exibido:', Math.round((total / CAPACIDADE) * 100) + '%', '(esperado 142%)');

const grupo = {};
for (const r of jul31) grupo[r.projeto] = (grupo[r.projeto] || 0) + r.novaColunaOrcada;
const ordenado = Object.entries(grupo).sort((a, b) => b[1] - a[1]);
console.log('\nTop conteúdos (Total | % = total/102):');
for (const [proj, val] of ordenado.slice(0, 5)) {
  console.log(`  ${proj} | ${val.toFixed(4)} | ${Math.round((val / CAPACIDADE) * 100)}%`);
}

const totalOk = Math.abs(total - 144.333333) < 0.001;
const pctOk = Math.round((total / CAPACIDADE) * 100) === 142;
console.log('\nRESULTADO:', falhas === 0 && totalOk && pctOk ? 'TODOS OS TESTES PASSARAM' : 'HÁ FALHAS');
process.exit(falhas === 0 && totalOk && pctOk ? 0 : 1);
