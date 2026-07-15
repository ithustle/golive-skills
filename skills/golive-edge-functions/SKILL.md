---
name: golive-edge-functions
description: Escrever edge functions no GoLive — uma pasta functions/ onde cada ficheiro é uma rota, handlers em TypeScript (compilados para JS no deploy), o contrato req/resposta, e como publicar e medir o consumo.
---

# GoLive — Edge Functions

Funções serverless que correm na **borda** (isolados V8), perto do utilizador, e
escalam sozinhas. Facturadas por invocação: **1.648 Kz / 500.000**.

## Estrutura: cada ficheiro é uma rota

Uma pasta `functions/` sem framework (sem `package.json` de app, sem
`index.html`) — o `golive deploy` deteta o tipo automaticamente.

| Ficheiro | Rota |
|---|---|
| `functions/index.ts` | `/` |
| `functions/hello.ts` | `/hello` |
| `functions/api/users.ts` | `/api/users` |

## Handler (TypeScript ou JavaScript)

Escreve em **TypeScript** (`.ts`) ou JS (`.mjs`) — o deploy **compila TS → JS**
(apaga os tipos), sem `tsconfig` nem build da tua parte. Cada ficheiro exporta
um `default` que recebe `req` e devolve `{ status?, headers?, body? }`:

```ts
// functions/hello.ts  ->  /hello?name=Ana
export default async (req: { query: Record<string, string> }) => ({
  status: 200,
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ hello: req.query.name ?? "world" }),
});
```

`req`: `{ method, path, query, headers, body? }` (`body` é texto cru; `undefined`
em GET/HEAD). A resposta: `status` (default 200), `headers` (default
`content-type: application/json`), `body` (texto).

## Publicar

```bash
golive deploy          # deteta edge-functions e publica as rotas
golive functions ls    # rotas + invocações/GB-s/Kz do período
```

**Ideal para:** APIs pequenas, webhooks, redirects, ou lógica na borda sem gerir
servidores.

## Regras

- **Auto-contido:** cada handler não faz `import` de outros ficheiros nem de
  pacotes externos (não há bundling). O `import type` é apagado na compilação,
  por isso podes tipar à vontade.
- Rotas desconhecidas devolvem 404. Erros no handler devolvem 500 com a mensagem.
