---
name: golive-edge-functions
description: Escrever edge functions no GoLive — uma pasta functions/ onde cada ficheiro é uma rota, handlers em TypeScript no contrato Web/Fetch (Request → Response), com dependências npm, e como publicar e medir o consumo.
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

Ficheiros ou pastas começados por `_` (ex.: `_lib.ts`) são **privados**: podes
importá-los, mas não viram rota.

## Handler: contrato Web/Fetch

Escreve em **TypeScript** (`.ts`) ou JS (`.mjs`) — o deploy **compila e empacota**
por ti, sem `tsconfig` nem build da tua parte. Cada ficheiro exporta um `default`
que recebe um `Request` e devolve um `Response` (as APIs standard da Web):

```ts
// functions/hello.ts  ->  /hello?name=Ana
export default async (request: Request) => {
  const name = new URL(request.url).searchParams.get("name") ?? "world";
  return Response.json({ hello: name });
};
```

Tens a `Request` inteira: `request.method`, `request.url`, `request.headers` e o
corpo com `await request.json()` / `request.text()`. Devolves qualquer `Response`
(`Response.json(...)`, HTML, redirects, streams…).

## Dependências

Podes fazer `import` de pacotes npm e de outros ficheiros — o deploy empacota
tudo num módulo auto-contido por rota:

```ts
// functions/slug.ts
import slugify from "slugify";        // pacote npm
import { greet } from "./_lib.js";    // ficheiro teu (privado)

export default (request: Request) =>
  Response.json({ slug: slugify(greet("Olá Mundo")) });
```

## Publicar

```bash
golive deploy          # deteta edge-functions, empacota e publica as rotas
golive functions ls    # rotas + invocações/GB-s/Kz do período
```

**Ideal para:** APIs pequenas, webhooks, redirects, ou lógica na borda sem gerir
servidores.

## Regras

- O handler **tem de** devolver um `Response`. Rotas desconhecidas devolvem 404;
  erros no handler devolvem 500 com a mensagem.
- `_ficheiro` / `_pasta` são privados (importáveis, mas não são rotas).
