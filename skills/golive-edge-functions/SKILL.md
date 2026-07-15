---
name: golive-edge-functions
description: Escrever edge functions no GoLive — uma pasta functions/ onde cada ficheiro é uma rota, handlers em TypeScript no contrato Web/Fetch (Request → Response), com dependências npm, e como publicar e medir o consumo.
license: MIT
metadata:
  author: golive
  version: "1.0"
  language: pt
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

## Site estático + funções = dois projectos

Um projecto é de um tipo só (estático **ou** edge). Uma `functions/` ao lado do
`index.html` do site **não** é publicada como função (vai como estático ou é
ignorada). Dá a cada um a sua raiz e publica-os em separado:

```
loja/
  site/                 # projecto estático
    index.html
  api/                  # projecto edge (sem index.html aqui)
    functions/
      hello.ts
```

```bash
cd site && golive deploy   # → loja.golive.ao         (estático)
cd api  && golive deploy   # → api-da-loja.golive.ao  (funções)
```

Subdomínios diferentes; o site chama as funções pelo URL do `api-…` (com CORS se
preciso). Cada pasta tem o seu `golive.json` (liga com `golive init` uma vez).

## Regras

- O handler **tem de** devolver um `Response`. Rotas desconhecidas devolvem 404;
  erros no handler devolvem 500 com a mensagem.
- `_ficheiro` / `_pasta` são privados (importáveis, mas não são rotas).
