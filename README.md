# Mapa de Calor de Ocupação

MVP web para visualização de ocupação por **semana do ano** e **dia da semana**, com edição local
(via `localStorage`) e perfis mock de **editor** e **visualizador**.

> Fase atual: validação funcional (sem Firebase/OIDC). A persistência e autenticação
> corporativas entram em uma etapa posterior.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- date-fns (apenas formatação de datas)
- ExcelJS (exportação XLSX; import dinâmico)
- Vitest (testes)
- GitHub Pages (publicação)

## Funcionalidades

- Login mock por e-mail (sem senha)
- Heatmap em **dois blocos semestrais** lado a lado (jan–jun / jul–dez)
- **Gráfico lateral** por semana com **escala de cor relativa** (mín→verde, média→laranja, máx→vermelho) e **seletor Total / Média / Pico**
  - **Total:** soma dos percentuais diários da semana
  - **Média:** média dos percentuais diários (dias no intervalo; sem dado = 0%)
  - **Pico:** maior percentual diário, com a data de ocorrência (tooltip mostra os três indicadores)
- Clique numa semana do gráfico **destaca** a semana no heatmap (sem filtrar), com scroll automático; a seleção persiste ao trocar de modo
- Filtro de **Projeto/Conteúdo** **multiselect pesquisável** (checkboxes, "Selecionar todos", "Limpar seleção")
- Filtros de **data inicial**, **data final** e **tipo**
- Alternância **Visão Macro / Detalhada**
  - **Macro:** célula compacta com o percentual
  - **Detalhada:** célula expandida com **Top 6 projetos + "Outros N"** (clique abre o Drawer/Resumo)
- Hover na célula com **tooltip** (Floating UI: flip/shift, nunca sai da viewport)
- Clique na célula abre o **Drawer** com abas **Resumo** e **Registros**
- Aba Registros: registros individuais + edição da linha completa
- Heatmap/tooltip/totais recalculam imediatamente
- Legenda de cores visível
- Botão **Restaurar dados** (limpa `localStorage`)
- Botão **Exportar Excel** — gera a **base completa** (aba `Base` / Excel Table `Tabela1`, 16 colunas), ignorando filtros

## Exportação Excel

- Biblioteca: **ExcelJS** (import dinâmico — não afeta o bundle inicial).
- Sempre exporta a **base completa efetiva** (`dataRepository.exportAll()`), com todas as edições persistidas; **não** respeita filtros visuais.
- Aba `Base` com as 16 colunas na ordem original da `Tabela1` + Excel Table `Tabela1`, autofilter e 1ª linha congelada.
- `Semana`/`Dia`/`Mês` são **recalculados a partir de `DATA`** no momento do export.
- Datas gravadas como data/hora real do Excel (`dd/mm/yyyy` e `dd/mm/yyyy hh:mm`); campos numéricos permanecem numéricos.
- Nome derivado dos anos da base: `Controles_ION_<anos>_atualizado_YYYYMMDD_HHmm.xlsx`
  (ex.: `Controles_ION_2027-2028_atualizado_20261008_1530.xlsx`).
- A coluna `ID` original **é exportada**; o `uuid` interno **não** (permanece só na aplicação).
- As demais abas/fórmulas do arquivo original (JUNCAO, Gráficos, Semanal, ANÁLISE MAPA, Categorias, pivôs) **não** são recriadas.

## Regras de cálculo

- Capacidade fixa: **102**
- `percentual = SUM(Nova Coluna Orçada) / 102 * 100`
- `WEEKNUM(DATA, 2)`: semana começa na segunda-feira; semana que contém 01/01 é a semana 1
- `WEEKDAY(DATA, 2)`: seg=1 … dom=7
- Semanas 53/53 e percentuais acima de 100% são suportados

Testes obrigatórios (todos validados em `scripts/validate.cjs`):

| Data       | Semana | Dia  |
|------------|--------|------|
| 01/01/2027 | 1      | sex  |
| 04/01/2027 | 2      | seg  |
| 31/12/2027 | 53     | sex  |

Validação do caso real **31/07/2027**: total `144,33`, percentual `142%`,
principais conteúdos: SÉRIE B 16%, TÊNIS DE MESA 9%, WSL 8%, TROCA DE PASSES 6%.

## Executar localmente

```bash
npm install
npm run dev
```

Acesse a URL indicada no terminal (padrão: http://localhost:5173/mapa-de-calor/).

## Configurar editores (mock)

Edite a lista em [`src/config/mockUsers.ts`](src/config/mockUsers.ts):

```ts
export const EDITORS = [
  "editor1@empresa.com",
  "editor2@empresa.com",
  "editor3@empresa.com",
  "editor4@empresa.com",
];
```

- E-mail na lista → `editor`
- Qualquer outro e-mail → `viewer`

## Ajustar cores do heatmap

Todas as faixas ficam centralizadas em
[`src/config/heatmapConfig.ts`](src/config/heatmapConfig.ts):

| Faixa      | Cor     |
|------------|---------|
| 0–80%      | verde   |
| 81–100%    | amarelo |
| 101–120%   | laranja |
| acima 120% | vermelho|

## Dados

- Base gerada da planilha `Tabela1` (aba "Base") → [`src/data/ocupacoes.json`](src/data/ocupacoes.json)
- Cada registro preserva a **linha completa** da Tabela1:
  `dtHrInicioRecurso`, `dtHrFimRecurso`, `semana`, `dia`, `mes`, `projeto`,
  `tipo`, `idPlanilha`, `nmRecurso`, `status`, `tipo2`, `site`, `data`,
  `hora2`, `horaOrcada`, `novaColunaOrcada`
- `semana`, `dia` e `mes` são **recalculados a partir de `data`** (nunca editados manualmente)
- Script de conversão: [`scripts/convert.cjs`](scripts/convert.cjs)
- Script de validação: [`scripts/validate.cjs`](scripts/validate.cjs)

```bash
node scripts/validate.cjs
```

### Camada de dados (repository)

Os componentes/hooks não acessam JSON ou `localStorage` diretamente. Tudo passa por
[`src/services/repository`](src/services/repository):

- `DataRepository` (interface): `getAll`, `getById`, `update`, `reset`, `exportAll`
- `LocalDataRepository` (atual): JSON + `localStorage`
- Futuro: `FirestoreDataRepository` — sem alterar Heatmap, Drawer, filtros ou cálculos.

## Testes

Testes automatizados com **Vitest** (round-trip da exportação):

```bash
npm run test
```

Cobrem: 16 colunas na ordem correta, 7.233 registros, tipos (data/data-hora/número),
preservação de `ID`, edição de `Nova Coluna Orçada`, recálculo de `Semana/Dia/Mês` ao mudar `DATA`,
existência da Excel Table `Tabela1` e validação do caso `31/07/2027` (total `144,333…`).

## Build e deploy (GitHub Pages)

```bash
npm run build
npm run deploy
```

O `base` do Vite está configurado como `/mapa-de-calor/` em `vite.config.ts`
(ajuste caso o repositório tenha outro nome).

URL esperada: `https://<usuario>.github.io/mapa-de-calor/`

### Alternativa via GitHub Actions

Publique o conteúdo de `dist/` na branch `gh-pages` e ative em
**Settings → Pages → Source: Deploy from a branch → gh-pages**.

## Estrutura

```
src/
├── components/   # Header, Filters, Heatmap, HeatmapCell, Tooltip, Drawer, Login, WeekBars, ...
├── config/       # mockUsers.ts, heatmapConfig.ts
├── data/         # ocupacoes.json
├── hooks/        # useAuth.ts, useOcupacoes.ts
├── services/
│   ├── repository/   # DataRepository, LocalDataRepository
│   └── export/       # exportColumns, exportWorkbook (+ teste)
├── utils/        # weekNumber.ts, calculations.ts, dateUtils.ts
├── types/        # index.ts
└── styles/       # globals.css
```

## Próximos passos (fora deste MVP)

- Autenticação OIDC corporativa (Firebase Authentication)
- Persistência em Cloud Firestore + Security Rules
- Histórico de alterações
- Importação de planilha
