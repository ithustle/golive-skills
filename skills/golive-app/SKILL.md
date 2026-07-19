---
name: golive-app
description: Scaffold de app Free no GoLive — site estático + @golive/auth + @golive/data + @golive/storage (sem edge/PAYG). Use quando o utilizador quer uma app completa com login, DB e ficheiros.
license: MIT
metadata:
  author: golive
  version: "1.0"
  language: pt
---

# GoLive — App Free completa (Auth + Data + Storage)

Monta uma app **React/Vite estática** no plano Free com:

| Feature | SDK | Skill detalhada |
|---------|-----|-----------------|
| Login | `@golive/auth` | golive-auth |
| Postgres | `@golive/data` | golive-database |
| Ficheiros | `@golive/storage` | golive-storage |
| Deploy | CLI | golive-deploy |

**Não** actives edge functions no Free. Edge (`pg` + `DATABASE_URL` ou SDK + serviceKey) = PAYG (skill golive-edge-functions).

## Checklist do agente

1. [ ] `golive login` · `golive link` (ou `golive init`)
2. [ ] `golive auth enable` · `golive db create`
3. [ ] Schema SQL (`seed.sql` + `golive db query` / seed no Dev Pack)
4. [ ] Tabelas multi-user com coluna **`user_id`**
5. [ ] Instalar SDKs e criar `src/lib/golive.js` (ou `.ts`)
6. [ ] `.env.example` com `VITE_GOLIVE_*`
7. [ ] `golive.json` com Dev Pack: auth + database + storage
8. [ ] `golive dev` → provar login, CRUD, upload
9. [ ] `golive deploy` (static)

## Instalar SDKs

```bash
npm i https://golive.co.ao/sdk/golive-auth.tgz \
      https://golive.co.ao/sdk/golive-data.tgz \
      https://golive.co.ao/sdk/golive-storage.tgz
```

## Cliente unificado (`src/lib/golive.js`)

```js
import { GoLiveAuth } from "@golive/auth";
import { GoLiveData } from "@golive/data";
import { GoLiveStorage } from "@golive/storage";

const isLocal = ["localhost", "127.0.0.1"].includes(location.hostname);
const origin = `${location.protocol}//${location.host}`;

export const auth = new GoLiveAuth(
  isLocal
    ? {
        apiKey: "dev",
        tenant: "dev",
        endpoints: {
          identity: `${origin}/__golive/auth/identity/v1`,
          secureToken: `${origin}/__golive/auth/token/v1`,
          controlPlane: `${origin}/__golive/auth`,
        },
      }
    : {
        apiKey: import.meta.env.VITE_GOLIVE_AUTH_API_KEY,
        tenant: import.meta.env.VITE_GOLIVE_AUTH_TENANT,
        controlPlane: import.meta.env.VITE_GOLIVE_CONTROL_PLANE,
      },
);

const projectId = import.meta.env.VITE_GOLIVE_PROJECT_ID || (isLocal ? "local" : "");
const apiKey = import.meta.env.VITE_GOLIVE_AUTH_API_KEY || (isLocal ? "dev" : "");

export const db = new GoLiveData({
  projectId,
  apiKey,
  getToken: () => auth.getIdToken(),
  endpoint: isLocal ? `${origin}/__golive/data` : undefined,
});

export const storage = new GoLiveStorage({
  projectId,
  apiKey,
  getToken: () => auth.getIdToken(),
  endpoint: isLocal ? `${origin}/__golive/storage` : undefined,
  publicFilesBase: isLocal
    ? `${origin}/__golive/files/${projectId}`
    : undefined,
});
```

## Padrões

### Perfil / linhas por user
```js
await db.from("profiles").upsert({
  user_id: auth.currentUser.uid,
  name: "Ana",
}, ["user_id"]);
```

### Avatar
```js
await storage.uploadFile("avatar.png", file); // → users/{uid}/avatar.png
const { url } = await storage.getDownloadUrl("avatar.png"); // ~1h
// se expirar: storage.refreshDownloadUrl("avatar.png")
// grava no Postgres só o path "avatar.png", não base64
```

### Assets públicos do projecto (edge/serviceKey)
```js
// só no servidor — serviceKey do dashboard (Integrar no cliente)
await storage.uploadPublic("logo.png", bytes);
<img src={storage.getPublicUrl("logo.png")} />
```

## `.env.example`

```
VITE_GOLIVE_PROJECT_ID=
VITE_GOLIVE_AUTH_API_KEY=
VITE_GOLIVE_AUTH_TENANT=
VITE_GOLIVE_CONTROL_PLANE=
# opcional (defaults oficiais se omitidos)
# VITE_GOLIVE_DATA_ENDPOINT=
# VITE_GOLIVE_STORAGE_ENDPOINT=
```

Valores em produção: dashboard → projecto → Auth / Database / Storage → **Integrar no cliente**.

## `golive.json` (Dev Pack)

```json
{
  "dev": {
    "emulators": {
      "auth": true,
      "database": true,
      "storage": true,
      "functions": false
    },
    "seed": "seed.sql",
    "db": true,
    "open": true
  }
}
```

## Anti-padrões

- ❌ `DATABASE_URL` / `serviceKey` no bundle do browser
- ❌ Foto em base64 na DB (usa storage)
- ❌ Edge no Free só para CRUD simples (usa Data API)
- ❌ Links assinado como CDN permanente (usa `public/` + `getPublicUrl`)
- ❌ Inventar paths de auth (`/accounts:signUp`) — o SDK já sabe

## Referência viva

O projecto demo **ProfileMe** usa este padrão (auth + data + storage Free; edge opcional).
