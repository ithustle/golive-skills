---
name: golive-storage
description: Armazenamento de ficheiros GoLive — SDK @golive/storage (browser Free + edge), CLI, dashboard, Dev Pack, links temporários e facturação por GB.
license: MIT
metadata:
  author: golive
  version: "1.4"
  language: pt
---

# GoLive — Armazenamento de ficheiros

Guarda ficheiros (imagens, PDFs, uploads dos utilizadores…) por projecto.
Cobrado **1.250 Kz/GB·mês**. Free: **1 GB** (site + ficheiros).

## Onde podes usar

| Superfície | Como | Plano |
|---|---|---|
| **Browser (React)** | **`@golive/storage`** + JWT | **Free** e PAYG |
| **Edge / backend** | SDK + `serviceKey` **ou** CLI/control plane | PAYG |
| **CLI / dashboard** | Owner (token developer) | Free+ |
| **Dev Pack** | `POST /__golive/storage` | local |

> Free **não** precisa de edge para a app carregar ficheiros: site estático + Auth + `@golive/storage`.

## SDK @golive/storage

```bash
npm i https://golive.co.ao/sdk/golive-storage.tgz
# ESM: import { GoLiveStorage } from "https://golive.co.ao/sdk/storage.js"
```

### Browser (Free)

Utilizador autenticado (`@golive/auth`). Paths sob **`users/{uid}/`** (prefixo automático se passares só `avatar.png`).

```js
import { GoLiveStorage } from "@golive/storage";
import { auth } from "./auth";

const storage = new GoLiveStorage({
  projectId: "…",
  apiKey: "AIza…",           // mesma do @golive/auth
  getToken: () => auth.getIdToken(),
});

const { path, error } = await storage.uploadFile("avatar.png", file);
const { url } = await storage.getDownloadUrl("avatar.png"); // ~1h, para <img>
await storage.list();
await storage.remove("avatar.png");
```

API: `list` · `upload` / `uploadFile` · `getDownloadUrl` · `download` · `remove` · `usage`.

**Este SDK nunca lança** — todos os métodos devolvem `{ …, error }`. Testa
sempre o `error`; um `try/catch` não apanha nada. (O `@golive/auth` faz o
contrário: **lança** `GoLiveAuthError`.)

- `upload`/`uploadFile` devolvem o **path absoluto já com o scope do
  utilizador** (`users/{uid}/avatar.png`), não o que passaste. **Guarda na base
  de dados o `result.path`.** Os restantes métodos aceitam as duas formas — o
  path relativo (`"avatar.png"`) e o absoluto resolvem para o mesmo objecto.
- Upload **≤ 8 MB**: bytes pela API (fiável no browser).
- Upload **> 8 MB**: URL assinado + PUT (`forceUrl: true` se quiseres sempre PUT).
- Links de download **temporários (~1 h)** — `refreshDownloadUrl` se expirar.
- Ler ficheiros da pasta **`public/`**: `getPublicUrl` = URL **permanente** (sem JWT).
- **Escrever** em `public/` (`uploadPublic` ou path `public/…`) requer `serviceKey` — no browser devolve `forbidden` (usa edge/backend).

### Edge (serviceKey unificada)

```ts
const storage = new GoLiveStorage({
  projectId: process.env.GOLIVE_PROJECT_ID!,
  apiKey: process.env.GOLIVE_AUTH_API_KEY!,
  serviceKey: process.env.GOLIVE_DATA_SERVICE_KEY, // project.serviceKey
  endpoint: process.env.GOLIVE_STORAGE_ENDPOINT,
  publicFilesBase: process.env.GOLIVE_PUBLIC_FILES_BASE,
});
// service role: qualquer path + pasta public/
await storage.uploadPublic("logo.png", bytes);
// → https://…/v1/public/files/{projectId}/public/logo.png
```

Env injectada no deploy edge: `GOLIVE_STORAGE_ENDPOINT`, `GOLIVE_PUBLIC_FILES_BASE`,
`GOLIVE_PROJECT_ID`, `GOLIVE_DATA_SERVICE_KEY` (service key do projecto).

#### Edge escreve, browser lê — sem segunda rota

Quando a edge grava um ficheiro **em nome de um utilizador** (webhook recebido,
importação, relatório gerado), escreve-o dentro de `users/{uid}/…`:

```ts
// edge, com serviceKey: pode escrever em qualquer path
await storage.upload(`users/${userId}/webhooks/${Date.now()}.json`, corpo, {
  contentType: "application/json",
});
```

Como o ficheiro fica na pasta do dono, o **browser lê-o com o scope normal de
utilizador** (`getDownloadUrl` com o path devolvido) — não é preciso uma segunda
edge function só para servir ficheiros. Guarda o `result.path` na tabela.

❌ Gravar em `public/` para o browser conseguir ler: torna o ficheiro público a
toda a gente. `users/{uid}/` dá exactamente o alcance certo.

## CLI (owner)

```bash
golive storage upload logo.png imagens/logo.png
golive storage ls imagens/
golive storage download imagens/logo.png ./logo.png
golive storage rm imagens/logo.png
```

## Dashboard

Separador **Armazenamento**: explorador, arrasta-e-larga, copiar link (~1 h), apagar, barra de uso.

## Dev Pack

```bash
golive dev init   # activa Storage
golive dev
```

```js
const storage = new GoLiveStorage({
  projectId: "local",
  apiKey: "dev",
  endpoint: "/__golive/storage",
  getToken: () => auth.getIdToken(),
  // serviceKey: "dev",  // testes edge local
});
```

## Checklist do agente

- [ ] Free + React: **`@golive/storage` + `@golive/auth`**, sem edge
- [ ] Nunca `serviceKey` no bundle do browser
- [ ] Paths multi-user: relativos (`avatar.png`) → `users/{uid}/…` automático
- [ ] Guardar no Postgres só o **path**, não base64; URL via `getDownloadUrl` na UI
- [ ] Links ~1 h — refrescar se expirarem
- [ ] Local: Dev Pack com Storage on + CLI ≥ 0.8.1
