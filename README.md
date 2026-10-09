# Mapa de Calor de Ocupação

Aplicação web para visualização de ocupação por **semana do ano** e **dia da semana**, com
autenticação corporativa (**OIDC**) e perfis **editor** e **visualizador**.

> **AMBIENTE OFICIAL:** https://mapa-de-calor.web.app
>
> - **GitHub** → código-fonte, versionamento e backups (não é ambiente de execução).
> - **Firebase Hosting** → publicação oficial.
> - **Cloud Firestore** → banco operacional.
> - **OIDC corporativo** → autenticação.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- date-fns (apenas formatação de datas)
- ExcelJS (exportação XLSX; import dinâmico)
- **Firebase** (Hosting, Authentication OIDC, Cloud Firestore)
- Vitest (testes)

## Funcionalidades

- Login corporativo via **OIDC** (Firebase Authentication)
- Heatmap em **dois blocos semestrais** lado a lado (jan–jun / jul–dez)
- **Gráfico lateral** por semana com **escala de cor relativa** (mín→verde, média→laranja, máx→vermelho) e **seletor Total / Média / Pico**
  - **Total:** soma dos percentuais diários da semana
  - **Média:** média dos percentuais diários (dias no intervalo; sem dado = 0%)
  - **Pico:** maior percentual diário, com a data de ocorrência (tooltip mostra os três indicadores)
- Clique numa semana do gráfico **destaca** a semana no heatmap (sem filtrar), com scroll automático; a seleção persiste ao trocar de modo
- Filtro de **Projeto/Conteúdo** **multiselect pesquisável**: ações fixas **Selecionar todos** / **Desmarcar todos**, busca que não altera a seleção. Estados explícitos: **Todos** (`selectionMode: all`), **Personalizado** (`custom` + lista) e **Nenhum** (`custom` + lista vazia).
- Filtro **Status registro** (`ATIVO` / `INATIVO` / `TODOS`, padrão `ATIVO`) — inativação lógica (sem apagar registros)
- **Contador de registros exibidos** (linhas) que reage a todos os filtros
- **Drag & drop** para mover uma alocação de um dia para outro (altera **apenas `DATA`**): habilitado só para **editor** com **exatamente 1 projeto** selecionado, com diálogo de confirmação
- Filtros de **data inicial**, **data final** e **Tipo** (multiselect pesquisável, com **Selecionar todos** / **Desmarcar todos** — permite excluir um único tipo, ex.: tudo menos `SEM CONTROLE`)
- Alternância **Visão Macro / Detalhada**
  - **Macro:** célula compacta com o percentual
  - **Detalhada:** célula expandida com **Top 6 projetos + "Outros N"** (clique abre o Drawer/Resumo)
- Hover na célula com **tooltip** (Floating UI: flip/shift, nunca sai da viewport)
- Clique na célula abre o **Drawer** com abas **Resumo** e **Registros**
- Aba Registros: registros individuais + edição da linha completa
- Heatmap/tooltip/totais recalculam imediatamente
- Legenda de cores visível
- Botão **Exportar Excel** — gera a **base completa** (aba `Base` / Excel Table `Tabela1`, ignorando filtros)

## Exportação Excel

- Biblioteca: **ExcelJS** (import dinâmico — não afeta o bundle inicial).
- Sempre exporta a **base completa** (todo o conjunto de registros), com todas as edições persistidas; **não** respeita filtros visuais.
- Aba `Base` com as **17 colunas** (as 16 originais da `Tabela1` + `STATUS_REGISTRO`) + Excel Table `Tabela1`, autofilter e 1ª linha congelada.
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

Acesse a URL indicada no terminal (padrão: http://localhost:5173/).

## Editores (perfis)

A lista de editores fica em [`src/config/mockUsers.ts`](src/config/mockUsers.ts) e é usada pela UI.
As **Security Rules** do Firestore (`firestore.rules`) usam a mesma lista de e-mails para autorizar escrita.

```ts
export const EDITORS = [
  "jose.slima@g.globo",
  "ffsampaio@g.globo",
  "flemos@g.globo",
];
```

- E-mail na lista → `editor` (pode editar)
- Qualquer outro usuario autenticado → `viewer` (somente leitura)

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
  `hora2`, `horaOrcada`, `novaColunaOrcada`, `statusRegistro`
- `statusRegistro` é normalizado em runtime (`?? 'ATIVO'`) para compatibilidade com bases antigas
- `semana`, `dia` e `mes` são **recalculados a partir de `data`** (nunca editados manualmente)
- Script de conversão: [`scripts/convert.cjs`](scripts/convert.cjs)
- Script de validação: [`scripts/validate.cjs`](scripts/validate.cjs)

```bash
node scripts/validate.cjs
```

### Camada de dados (repository)

Os componentes/hooks não acessam o banco diretamente. Tudo passa por
[`src/services/repository`](src/services/repository):

- `DataRepository` (interface): `subscribe` (tempo real), `update`, `updateMany`, `reset`
- `FirestoreDataRepository` (**atual**): Cloud Firestore — banco `mapa-de-calor`, coleção `ocupacoes`
- `LocalDataRepository`: implementação local (JSON + `localStorage`), mantida como referência

## Testes

Testes automatizados com **Vitest** (round-trip da exportação):

```bash
npm run test
```

Cobrem: 17 colunas na ordem correta, 7.233 registros, tipos (data/data-hora/número),
preservação de `ID`, edição de `Nova Coluna Orçada`, recálculo de `Semana/Dia/Mês` ao mudar `DATA`,
existência da Excel Table `Tabela1` e validação do caso `31/07/2027` (total `144,333…`).

## Firebase (produção)

- **Hosting:** site `mapa-de-calor` → **https://mapa-de-calor.web.app**
- **Firestore:** banco nomeado `mapa-de-calor` (`southamerica-east1`), coleção `ocupacoes` (1 documento por registro).
- **Auth:** OIDC corporativo (provider `oidc.gestaodecapacidade`), reaproveitado do projeto `gglobo-pea-hdg-prd`.
- **Perfis (app):** `editor`/`viewer` por e-mail (`src/config/mockUsers.ts`). **Rules** garantem escrita só para os e-mails de editor; leitura para autenticados.

### Configuração (`.env`, não versionado)

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=gglobo-pea-hdg-prd.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=gglobo-pea-hdg-prd
VITE_FIREBASE_STORAGE_BUCKET=gglobo-pea-hdg-prd.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_OIDC_PROVIDER_ID=oidc.gestaodecapacidade
VITE_FIRESTORE_DATABASE_ID=mapa-de-calor
```

### Scripts

```bash
npm run fb:rules    # publica firestore.rules no banco mapa-de-calor
npm run fb:import   # importa src/data/ocupacoes.json para o Firestore (7.233 docs)
npm run fb:deploy   # build + deploy do dist/ no site mapa-de-calor
```

> Requer `gcloud auth login` (token de acesso) e a chave de serviço em
> `GOOGLE_APPLICATION_CREDENTIALS` (para a importação). Nunca commite a chave nem o `.env`.

## Auditoria e gestão de acessos

- **Roles:** `admin` > `editor` > `viewer`. Fonte de verdade para as **Security Rules**: `usuarios/{uid}.role` (verificado no servidor). Custom claims são espelho para leitura rápida no frontend.
- **Admin bootstrap fixo** por UID nas rules (`jose.slima@g.globo`) para evitar lockout.
- **Coleções:** `usuarios/{uid}`, `acessosPendentes/{email}`, `historicoAlteracoes` (operacional), `historicoAcessos` (permissões).
- **Cloud Functions** (`functions/`, 2nd gen, `southamerica-east1`):
  - `auditarOcupacao` → grava `historicoAlteracoes` (diff dos campos relevantes) a cada alteração em `ocupacoes`.
  - `sincronizarClaims` → espelha `usuarios/{uid}.role` nas custom claims.
  - `sincronizarMeuAcesso` (callable) → provisiona `usuarios/{uid}` no login e aplica `acessosPendentes`.
  - `definirPapel` (callable, admin-only) → adiciona/remove editor e grava `historicoAcessos`.
- **Atribuição nas escritas de `ocupacoes`:** `atualizadoPor`, `atualizadoPorUid`, `atualizadoEm`, `ultimaOperacaoId` (validados nas rules; não entram em cálculos nem na exportação).
- **Frontend:** engrenagem no Header (só `admin`) → “Gerenciar acessos”; aba **Histórico** no Drawer (do dia e por registro).

### Ordem de deploy (importante)

```bash
# 1) Backend (requer permissões de Functions/Cloud Build + iam.serviceAccountUser)
firebase deploy --only functions
# 2) Regras do banco nomeado mapa-de-calor
npm run fb:rules
# 3) Migrar usuários existentes para usuarios/{uid} (+ claims)
node scripts/seed-usuarios.cjs
# 4) Frontend
npm run fb:deploy
```

> Deployar o **frontend** antes das Functions/regras/seed faz todos entrarem como `viewer`.

## Publicação (Firebase Hosting — oficial)

Ambiente oficial: **https://mapa-de-calor.web.app**

Fluxo: desenvolvimento → `npm run build` → `npm run test` → `npm run fb:deploy`.
O build usa `base: '/'` (raiz do Firebase Hosting). O GitHub Pages **não** faz parte do deploy.

## Estrutura

```
src/
├── components/   # Header, Filters, Heatmap, HeatmapCell, Tooltip, Drawer, Login, WeekBars, ...
├── config/       # mockUsers.ts (editores), heatmapConfig.ts
├── data/         # ocupacoes.json (fonte para importação)
├── hooks/        # useAuth.ts (OIDC), useOcupacoes.ts (Firestore em tempo real)
├── services/
│   ├── firebase.ts        # initializeApp / auth / firestore (banco mapa-de-calor)
│   ├── repository/        # DataRepository, FirestoreDataRepository, LocalDataRepository
│   └── export/            # exportColumns, exportWorkbook (+ teste)
├── utils/        # weekNumber.ts, calculations.ts, dateUtils.ts, ocupacao.ts, multiselect.ts
├── types/        # index.ts
└── styles/       # globals.css
```

## Próximos passos

- Histórico de alterações (auditoria)
- Importação de planilha XLSX direto na aplicação
- Paginação/carga sob demanda no Firestore (se o volume crescer)
