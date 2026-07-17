---
name: golive-database
description: Postgres GoLive — criar, DATABASE_URL (pooler), edge max:1, backend, Dev Pack pglite local, CLI, SGBD, backups. Não nomear o fornecedor cloud.
license: MIT
metadata:
  author: golive
  version: "1.5"
  language: pt
---

# GoLive — Base de dados (Postgres)

Cada projecto tem **no máximo uma** base Postgres gerida.

**Nunca** digas o nome do fornecedor cloud ao utilizador final (marca branca).

## Onde podes usar

| Onde | DB GoLive (`DATABASE_URL` pooler) | DB externa |
|---|---|---|
| **Edge functions** | **Sim** — injectada; `pg` com **`max: 1`** | **Não** → backend |
| **Backend** Node/Go/Next | **Sim** | **Sim** (tu configuras) |
| **Free** (só estático) | Consola/CLI até 100 MB; sem edge/backend | — |
| **Dev Pack local** | pglite + `DATABASE_URL` em `golive dev` | — |

## Produção

```bash
golive db create
golive db info
golive db url              # export DATABASE_URL=$(golive db url)
golive db query "select 1"
```

No **deploy** de edge (e backends geridos), a plataforma injecta `DATABASE_URL`
(string **pooler** quando aplicável).

### Edge

Ver skill **golive-edge-functions**. Resumo:

```ts
// Client por query — DATABASE_URL só no pedido (Dev Pack); estável com pglite local
import pg from "pg";

export async function query(text: string, params?: unknown[]) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL em falta");
  const local =
    connectionString.includes("localhost") || connectionString.includes("127.0.0.1");
  const client = new pg.Client({
    connectionString,
    ssl: local ? false : { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    return await client.query(text, params);
  } finally {
    await client.end().catch(() => {});
  }
}
```

### Backend Node

```js
import pg from "pg";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
```

## Dev Pack (local)

```bash
golive dev init    # activa Database (e Functions se precisares de API)
golive dev         # DATABASE_URL → pglite em .golive/dev/pg/
```

| | Local (Dev Pack) | Produção |
|---|---|---|
| Motor | **pglite** (ficheiros em `.golive/dev/`) | Postgres gerido (pooler) |
| URL | injectada (`postgresql://…localhost…` ou socket) | `golive db url` / inject no deploy |
| Dados | **não** são a DB de prod | cloud |
| Seed | `seed.sql` se `"dev": { "seed": "seed.sql" }` | migrações tuas |
| SQL UI | painel `/__golive/` → Database | dashboard → SGBD |

```bash
# Legado:
golive dev --db
```

**Agente:** em local, **não** assumes Neon/cloud; usa a `DATABASE_URL` do env do
`golive dev`. Cria tabelas via `seed.sql` ou SQL no painel.

## CLI / dashboard / backups (prod)

```bash
golive db query "select count(*) from pedidos"
golive db backup create
golive db backup schedule daily
golive db backup restore <id>
```

Dashboard: explorador de tabelas, CRUD, SQL.

## Limites e preços

- Free: **100 MB**, sem edge/backend.
- PAYG: escala; edge e backends ok.
- Backups retidos: **~1.250 Kz/GB·mês**.

## Checklist do agente

- [ ] Uma DB por projecto; criar com `golive db create` (prod)
- [ ] Edge: `max: 1`; backend: pool razoável (ex. 5)
- [ ] Local: Dev Pack **Database** ou `golive dev --db` + seed se preciso
- [ ] Não misturar dados pglite local com prod
- [ ] Não nomear o fornecedor Postgres cloud em copy de cliente
- [ ] DB externa → backend, não edge
