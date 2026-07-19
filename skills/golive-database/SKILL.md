---
name: golive-database
description: Postgres GoLive — CLI, @golive/data SDK (browser Free sem edge), edge com SDK ou pg directo, Dev Pack, backups. Nunca nomear o fornecedor cloud.
license: MIT
metadata:
  author: golive
  version: "1.9"
  language: pt
---

# GoLive — Base de dados (Postgres)

Cada projecto tem **no máximo uma** base Postgres gerida.

**Nunca** digas o nome do fornecedor cloud ao utilizador final (marca branca).

## Onde podes usar

| Superfície | Como | Plano |
|---|---|---|
| **Browser (React)** | **`@golive/data`** → Data API GoLive | **Free** e PAYG |
| **Edge functions** | ① `@golive/data` (gerido) **ou** ② `pg` + `DATABASE_URL` | PAYG |
| **Backend** Node/Go | `pg` / driver + `DATABASE_URL` ou SDK + serviceKey | PAYG |
| **CLI / SGBD / Dev Pack** | SQL, seed, browser de tabelas | Free+ |

> Free **não** precisa de edge para a app usar a DB: site estático + Auth + `@golive/data`.

## Produção — criar

```bash
golive db create
golive db info          # inclui dataServiceKey (só owner; servidor/edge)
golive db url
golive db query "select 1"
```

## SDK @golive/data — abrangente

O SDK cobre **todo o Postgres**:
1. **Query builder** — CRUD tipico de apps (browser + edge)
2. **`rpc`** — funcoes SQL do projecto
3. **`sql`** (serviceKey) — joins, CTEs, DDL, qualquer statement

Na **edge** podes escolher SDK (gerido) **ou** `pg` + `DATABASE_URL` (directo).

## SDK @golive/data (recomendado no frontend)

```bash
npm i https://golive.co.ao/sdk/golive-data.tgz
# ESM: import { GoLiveData } from "https://golive.co.ao/sdk/data.js"
```

### Browser (Free)

```js
import { GoLiveData } from "@golive/data";
import { auth } from "./auth"; // @golive/auth

const db = new GoLiveData({
  projectId: "…",
  apiKey: "AIza…",           // mesma chave pública do auth
  getToken: () => auth.getIdToken(),
});

// Tabelas com coluna user_id ficam scoped ao JWT automaticamente
const { data, error, row } = await db
  .from("profiles")
  .select("user_id", "name", "email")
  .eq("user_id", auth.currentUser.uid)
  .maybeSingle();

await db.from("profiles").upsert(
  { user_id: auth.currentUser.uid, name: "Ana", email: "ana@app.ao" },
  ["user_id"],
);
```

**Este SDK nunca lança** — devolve sempre `{ data, count, error, status }` (e
`row` com `.single()`/`.maybeSingle()`). Um `try/catch` à volta de um
`db.insert()` não apanha nada: **testa sempre o `error`**.

```js
const { data, error } = await db.from("notes").insert({ … });
if (error) return setErro(error.message);   // error.code é estável
```

(O `@golive/auth` faz o contrário: **lança** `GoLiveAuthError`.)

API do query builder:
- CRUD: `from(table|schema.table).select|insert|update|upsert|delete`
- Filtros: `eq neq gt gte lt lte like ilike in is contains containedBy overlaps textSearch not match or`
- Paginacao: `order limit offset range single maybeSingle count`
- Funcoes: `db.rpc(name, args)` · SQL total (serviceKey): `db.sql(text, params)`

### Datas voltam como string ISO

Colunas `date` e `timestamptz` chegam ao cliente como string ISO
(`"2026-07-19T00:00:00.000Z"`), não como `Date`. Formata sempre no **fuso
local**:

```js
new Date(linha.data).toLocaleDateString("pt-AO");   // 19/07/2026
```

❌ Não cortes a string (`linha.data.slice(0, 10)`): a oeste de UTC devolve o
**dia anterior**. Em Angola (UTC+1) uma `date` guardada como 19/07 serializa
para `2026-07-18T23:00:00.000Z` — o corte dá 18/07.

### SQL livre (só serviceKey — edge/backend)

```js
const db = new GoLiveData({
  projectId: process.env.GOLIVE_PROJECT_ID,
  apiKey: process.env.GOLIVE_AUTH_API_KEY,
  serviceKey: process.env.GOLIVE_DATA_SERVICE_KEY, // NUNCA no browser
});
const { data, error } = await db.sql("select * from profiles where created_at > $1", [since]);
```

### Edge — duas opções

1. **SDK** (`@golive/data` + serviceKey injectado no deploy) — CRUD/SQL gerido.  
2. **`pg` directo** — `process.env.DATABASE_URL` (pool `max: 1`, lazy / client por pedido).

## Dev Pack (local)

```bash
golive dev init    # Database (+ Auth se a app tiver login)
golive dev
```

```js
const db = new GoLiveData({
  projectId: "local",
  apiKey: "dev",
  endpoint: "http://localhost:18321/__golive/data",
  getToken: () => auth.getIdToken(),
  // serviceKey: "dev",  // só em código de edge local / testes SQL
});
```

Env injectada: `GOLIVE_DATA_ENDPOINT`, `GOLIVE_DATA_SERVICE_KEY=dev`, `DATABASE_URL` (pglite).

Painel `/__golive/` → Database: tabelas visuais, edit, insert, delete.

## Backend Node (sem SDK)

```js
import pg from "pg";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
```

## Checklist do agente

- [ ] Free + React: **`@golive/data` + `@golive/auth`**, sem edge
- [ ] Nunca `DATABASE_URL` / `serviceKey` no bundle do browser
- [ ] Tabelas multi-user: coluna `user_id` (scope automático)
- [ ] Edge: SDK **ou** `pg` (documenta a escolha)
- [ ] Local: Dev Pack Database + endpoint `/__golive/data`
- [ ] Não nomear o fornecedor Postgres cloud
