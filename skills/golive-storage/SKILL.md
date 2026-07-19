---
name: golive-storage
description: Armazenamento de ficheiros GoLive — SDK @golive/storage (browser Free + edge), CLI, dashboard, Dev Pack, links temporários e facturação por GB.
license: MIT
metadata:
  author: golive
  version: "1.1"
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

- Upload **≤ 8 MB**: bytes pela API (fiável no browser).
- Upload **> 8 MB**: URL assinado + PUT.
- Links de download **temporários (~1 h)** — não uses como CDN permanente.

### Edge (serviceKey)

```ts
const storage = new GoLiveStorage({
  projectId: process.env.GOLIVE_PROJECT_ID!,
  apiKey: process.env.GOLIVE_AUTH_API_KEY!,
  serviceKey: process.env.GOLIVE_DATA_SERVICE_KEY, // mesma service key do projecto
  endpoint: process.env.GOLIVE_STORAGE_ENDPOINT,
});
// service role: qualquer path (não só users/{uid}/)
```

Env injectada no deploy edge: `GOLIVE_STORAGE_ENDPOINT`, `GOLIVE_PROJECT_ID`, `GOLIVE_DATA_SERVICE_KEY`.

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
