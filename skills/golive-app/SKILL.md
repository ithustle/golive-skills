---
name: golive-app
description: Scaffold de app Free no GoLive — site estático + @golive/auth + @golive/data + @golive/storage (sem edge/PAYG). Use quando o utilizador quer uma app completa com login, DB e ficheiros.
license: MIT
metadata:
  author: golive
  version: "1.1"
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

**Dev — é aqui que se começa. Nada de produção antes disto estar verde.**

1. [ ] `golive login`
2. [ ] Scaffold (`npm create vite@latest . -- --template react`) + instalar SDKs
3. [ ] `golive dev init --emulators auth,database,storage`
       → gera `golive.json`, `seed.sql` e mete `.golive/` no `.gitignore`
4. [ ] **Reescrever o `seed.sql` gerado** — ver aviso abaixo
5. [ ] Tabelas multi-user com coluna **`user_id`**
6. [ ] `src/lib/golive.js` (ou `.ts`) + `.env.example` com `VITE_GOLIVE_*`
7. [ ] Acrescentar `.env` ao `.gitignore` (o `dev init` só trata do `.golive/`)
8. [ ] `golive dev` → provar login, CRUD e upload a sério

**Produção — só depois.**

9.  [ ] `golive init` — liga a pasta a um projecto (escreve o `projectId`)
10. [ ] `golive auth enable` · `golive db create`
11. [ ] `golive db query < seed.sql` — aplica o schema (aceita arg ou stdin; **não há `-f`**)
12. [ ] `golive env file .env` — envia as `VITE_GOLIVE_*`
13. [ ] `golive deploy --preview` → `golive deploy --prod`

### Três comandos que se confundem

| Comando | O que faz |
|---|---|
| `golive dev init` | configura os **emuladores locais** (é este o do fluxo de dev) |
| `golive init` | liga a pasta a um projecto **de produção** |
| `golive link` | liga um **repo GitHub** e passa a fazer deploy a cada push |

❌ Nunca uses `golive link` para ligar a pasta — dispara deploys.

### ⚠️ O `seed.sql` gerado é um placeholder

`golive dev init` escreve um `seed.sql` de exemplo **sem coluna `user_id`**.
Se o aproveitares tal como está, ficas com uma app onde **todos os utilizadores
vêem os dados uns dos outros**. Substitui-o pelo teu schema antes do primeiro
`golive dev`.

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

## Modelo de erros — os SDKs não são todos iguais

Lê isto antes de escreveres a primeira chamada. É a causa nº1 de código que
*parece* certo e falha em silêncio.

| SDK | Comporta-se como |
|---|---|
| `@golive/auth` | **lança** `GoLiveAuthError` (`.code`) → `try/catch` |
| `@golive/data` | **devolve** `{ data, count, error, status }` → `if (error)` |
| `@golive/storage` | **devolve** `{ …, error }` → `if (error)` |

```js
// auth: lança
try {
  await auth.signIn(email, password);
} catch (err) {
  setErro(err.message);           // err.code: INVALID_LOGIN_CREDENTIALS, …
}

// data / storage: devolvem — um try/catch aqui não apanha NADA
const { error } = await db.from("notes").insert({ … });
if (error) return setErro(error.message);
```

## Padrões

### Linhas por user — o scope é automático

A Data API no browser filtra sozinha pelo JWT: uma tabela com coluna `user_id`
só devolve as linhas do utilizador autenticado. Por isso a coluna **tem de se
chamar exactamente `user_id`**, e no `insert` preenche-la é responsabilidade
tua.

```js
await db.from("profiles").upsert({
  user_id: auth.currentUser.uid,
  name: "Ana",
}, ["user_id"]);
```

Um `.match({ user_id: uid })` no select é redundante (mas inofensivo, e torna a
intenção explícita).

### Avatar
```js
const { path, error } = await storage.uploadFile("avatar.png", file);
// path === "users/{uid}/avatar.png" — o SDK devolve o path JÁ com scope.
// Grava ESTE path no Postgres (nunca base64, nunca o URL assinado).

const { url } = await storage.getDownloadUrl(path); // ~1h
// se expirar: storage.refreshDownloadUrl(path)
```

Os métodos aceitam as duas formas — `"avatar.png"` e
`"users/{uid}/avatar.png"` resolvem para o mesmo objecto. Persiste o
`result.path` e usa sempre esse, para não teres duas convenções na base.

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

**Não escrevas isto à mão** — é o que `golive dev init --emulators
auth,database,storage` gera. Serve para confirmares o resultado:

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

## `golive dev` — o que esperar

Arranca Auth, Postgres (pglite), Storage e serve a app em `:18321`
(painel em `/__golive/`). O `seed.sql` corre no arranque.

⚠️ **Não há HMR.** O `golive dev` faz `npm run build` e serve o `dist/` — não é
o dev server do Vite. Depois de mexeres no código, reinicia. Para iteração
rápida de UI, corre o `npm run dev` do Vite em paralelo e usa o `golive dev`
para provar a integração.

## Anti-padrões

- ❌ `DATABASE_URL` / `serviceKey` no bundle do browser
- ❌ Foto em base64 na DB (usa storage)
- ❌ Edge no Free só para CRUD simples (usa Data API)
- ❌ Links assinado como CDN permanente (usa `public/` + `getPublicUrl`)
- ❌ Inventar paths de auth (`/accounts:signUp`) — o SDK já sabe
- ❌ `try/catch` à volta de `db.*` / `storage.*` à espera de apanhar erros
- ❌ Guardar o path relativo do upload quando o SDK devolveu o absoluto
- ❌ Usar o `seed.sql` gerado sem lhe pôr `user_id`

## Referência viva

O projecto demo **ProfileMe** usa este padrão (auth + data + storage Free; edge opcional).
