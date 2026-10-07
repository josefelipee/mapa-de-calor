# Mapa de Calor de Ocupação

MVP web para visualização de ocupação por **semana do ano** e **dia da semana**, com edição local
(via `localStorage`) e perfis mock de **editor** e **visualizador**.

> Fase atual: validação funcional (sem Firebase/OIDC). A persistência e autenticação
> corporativas entram em uma etapa posterior.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- date-fns (apenas formatação de datas)
- GitHub Pages (publicação)

## Funcionalidades

- Login mock por e-mail (sem senha)
- Heatmap por mês → semana → dia da semana
- Filtros de **data inicial**, **data final** e **tipo**
- Hover na célula com composição (conteúdos agrupados e ordenados)
- Clique na célula abre um **Drawer** lateral
- Editor altera registros individualmente e salva localmente
- Heatmap/tooltip/totais recalculam imediatamente
- Botão **Restaurar dados** (limpa `localStorage`)

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
- Script de conversão: [`scripts/convert.cjs`](scripts/convert.cjs)
- Script de validação: [`scripts/validate.cjs`](scripts/validate.cjs)

```bash
node scripts/validate.cjs
```

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
├── components/   # Header, Filters, Heatmap, HeatmapCell, Tooltip, Drawer, Login
├── config/       # mockUsers.ts, heatmapConfig.ts
├── data/         # ocupacoes.json
├── hooks/        # useAuth.ts, useOcupacoes.ts
├── services/     # storageService.ts (localStorage)
├── utils/        # weekNumber.ts, calculations.ts, dateUtils.ts
├── types/        # index.ts
└── styles/       # globals.css
```

## Próximos passos (fora deste MVP)

- Autenticação OIDC corporativa (Firebase Authentication)
- Persistência em Cloud Firestore + Security Rules
- Histórico de alterações
- Importação de planilha
