---
name: golive-edge-functions
description: Edge functions GoLive — handlers Request→Response, CORS, pg+DATABASE_URL (pooler), Dev Pack local (functions + db), deploy. Não inventar frameworks.
license: MIT
metadata:
  author: golive
  version: "1.8"
  language: pt
---

# GoLive — Edge Functions

**Backend gerido**: cada ficheiro em `functions/` é uma rota HTTP. A plataforma
trata de HTTPS, domínio, escala, **CORS** (allowlist) e injecta
**`DATABASE_URL`** (Postgres GoLive, URL **pooler**).

Facturação: **~1.648 Kz / 500.000** invocações (PAYG).

> **Edge vs Backend**
> - **Edge** = API da plataforma + **só** Postgres GoLive (`pg`).
> - **Backend** (Node/Go/Next) = mais controlo; DB GoLive **ou** a tua (Mongo…).
> - **Free**: sem edge/backends. DB 100 MB só consola/CLI.

## Estrutura e contrato

| Ficheiro | Rota |
|---|---|
| `functions/index.ts` | `/` |
| `functions/hello.ts` | `/hello` |
| `functions/api/items.ts` | `/api/items` |
| `functions/_db.ts` | **privado** (sem rota; importável) |

```ts
// export default (request: Request, env?) => Response | Promise<Response>
export default async (request: Request) => {
  return Response.json({ ok: true, path: new URL(request.url).pathname });
};
```

- Devolve **sempre** um `Response`.
- Rota inexistente → `404` `{ "error": "no_such_function" }`.
- CORS: `OPTIONS` pela plataforma; origins = `*.golive.ao`, `*.golive.co.ao`,
  localhost, domínio custom. **Outras origins não recebem ACAO.**

```bash
golive deploy
golive functions ls
```

## Postgres na edge (prod)

```bash
golive db create   # PAYG, no projecto edge
# package.json: { "dependencies": { "pg": "^8.13.0" } }
```

```ts
// functions/_db.ts
// 1) Lê DATABASE_URL só dentro da query (Dev Pack injecta por pedido).
// 2) Client connect/end por query — fiável em local (pglite) e ok na edge (pooler).
import pg from "pg";

export async function query(text: string, params?: unknown[]) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL em falta");
  const local =
    connectionString.includes("localhost") || connectionString.includes("127.0.0.1");
  const client = new pg.Client({
    connectionString,
    connectionTimeoutMillis: 10_000,
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

Alternativa em prod com tráfego: `pg.Pool({ max: 1 })` **lazy** (criar no 1º pedido,
não no top-level do módulo).

**Regras**
- **Nunca** `new pg.Pool({ connectionString: process.env.DATABASE_URL })` no
  top-level. No Dev Pack a `DATABASE_URL` só existe **no momento do pedido** —
  sonda numa edge function:

  ```json
  {"noCarregamentoDoModulo": null, "noPedido": "presente"}
  ```

  O pool arranca com `undefined` e **todas as rotas que tocam na base devolvem
  500**, enquanto as que não tocam continuam a responder — o que torna o sintoma
  enganador (parece que a função está bem e só "aquela query" é que falha).

  ⚠️ O `golive dev init` **até à versão 0.8.2** gerava o `functions/_db.ts`
  exactamente com este anti-padrão. Se o teu tiver um `pg.Pool` no top-level,
  substitui-o pelo helper acima.
- Em local, evita vários `Pool` (cada ficheiro edge é um bundle).
- URL prod = **pooler**. DB externa → backend, não edge.

## Dev Pack (local) — OBRIGATÓRIO para desenvolver offline

```bash
golive dev init    # multiselect: ↑/↓ · Space · Enter — activa Functions + Database
golive dev         # painel http://localhost:18321/__golive/
```

Com **Functions** + **Database** no Dev Pack:

| Env injectada | Uso |
|---|---|
| `DATABASE_URL` | Postgres **pglite** local (não é a cloud) |
| `GOLIVE_AUTH_*` | se Auth on |
| `GOLIVE_STORAGE_*` | se Storage on |

- Handlers em `functions/` são **reempacotados ao gravar**.
- Podes ter **site Vite + functions no mesmo host**: rotas exactas de function
  têm prioridade sobre o estático (`/hello` vs `/`).
- Seed opcional: `seed.sql` + `"dev": { "seed": "seed.sql" }` no `golive.json`.
- SQL no painel: tab **Database**.

```bash
# Legado ainda funciona:
golive dev --db
```

**Não** uses `yarn dev` sozinho se precisas de `DATABASE_URL` / edge local —
usa `golive dev` com o Dev Pack.

## Multi-alvo (site + API em prod)

```
loja/
  golive.json   # apps.site + apps.api
  web/          # estático
  api/functions/
```

```bash
golive deploy          # as duas
golive dev             # multi: portas 18321, 18322, …
```

CORS: site `*.golive.ao` → API `*.golive.ao` ok.

## Dados: @golive/data vs pg

Na edge tens **duas opções**:

1. **`@golive/data`** com `serviceKey` (`GOLIVE_DATA_SERVICE_KEY`) — query builder + `rpc` + `sql` (todo o Postgres), sem montar SQL à mão se nao quiseres.
2. **`pg` + `DATABASE_URL`** — controlo total (pool lazy / client por pedido).

No **browser Free** usa só `@golive/data` + JWT (sem edge). Ver skill **golive-database**.

## Checklist do agente

- [ ] Handlers Web/Fetch; pasta `functions/`; `_` = privado
- [ ] `pg` + `process.env.DATABASE_URL` lida **dentro** da query (nunca no top-level)
- [ ] Local: Dev Pack **Functions** (+ **Database** se SQL)
- [ ] Prod: `golive db create` no projecto edge + `golive deploy`
- [ ] Sem Express/Fastify na edge; sem Mongo na edge
- [ ] Sem inventar rotas de plataforma (`/api/v1/...` da app ≠ control plane)
