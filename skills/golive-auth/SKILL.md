---
name: golive-auth
description: Auth gerido GoLive — SDK @golive/auth (prod e Dev Pack local), paths exactos, tenants, MAU. Usar sempre o SDK; nunca inventar rotas REST.
license: MIT
metadata:
  author: golive
  version: "1.3"
  language: pt
---

# GoLive — Autenticação

Login email/password gerido. **Sempre** usa o SDK `@golive/auth` — **não** chames
APIs Identity Toolkit / REST “à mão” nem inventes paths.

| Ambiente | Como |
|---|---|
| **Produção** | `golive auth enable` → apiKey + tenant do dashboard |
| **Local (Dev Pack)** | `golive dev init` (Auth on) → `golive dev` → endpoints em `localhost` |

## Produção

```bash
golive auth enable
npm i https://golive.co.ao/sdk/golive-auth.tgz
```

```js
import { GoLiveAuth } from "@golive/auth";

const auth = new GoLiveAuth({
  apiKey: "AIza…",  // dashboard → Autenticação → Integrar
  tenant: "…",
});

await auth.signUp(email, password);   // ou signIn
const token = await auth.getIdToken(); // Authorization: Bearer <token>
auth.onChange((user) => { /* … */ });
```

CDN: `import { GoLiveAuth } from "https://golive.co.ao/sdk/auth.js"`.

Métodos: `signUp`, `signIn`, `signOut`, `getIdToken`, `sendPasswordReset`,
`updateProfile`, `onChange`, `currentUser`. Erros: `GoLiveAuthError` com `.code`.

## Dev Pack (local) — OBRIGATÓRIO para `golive dev`

Com Auth activo no Dev Pack, a env injectada inclui:

```
GOLIVE_AUTH_ENDPOINT=http://localhost:18321/__golive/auth
GOLIVE_AUTH_API_KEY=dev
GOLIVE_AUTH_TENANT_ID=dev
```

### Config correcta do SDK (copiar tal qual)

```js
import { GoLiveAuth } from "@golive/auth";

const base = import.meta.env.VITE_GOLIVE_AUTH_ENDPOINT
  ?? "http://localhost:18321/__golive/auth";

const auth = new GoLiveAuth({
  apiKey: "dev",
  tenant: "dev",
  // Os 3 endpoints apontam para o mesmo host do Dev Pack:
  endpoints: {
    identity: `${base}/identity/v1`,
    secureToken: `${base}/token/v1`,
    controlPlane: base, // signUp usa POST {base}/v1/public/auth/signup
  },
});

await auth.signUp("ana@app.ao", "secret12");
await auth.signIn("ana@app.ao", "secret12");
```

### Paths reais (só se debugares com fetch — preferir o SDK)

Base = `http://localhost:<porta>/__golive/auth`

| Operação | Método | Path | Body |
|---|---|---|---|
| **signUp** (SDK) | POST | `/v1/public/auth/signup` | JSON `{ email, password, apiKey, tenant }` |
| **signIn** | POST | `/identity/v1/accounts:signInWithPassword` | JSON `{ email, password, returnSecureToken: true }` |
| **signUp** (identity) | POST | `/identity/v1/accounts:signUp` | JSON `{ email, password }` |
| **refresh** | POST | `/token/v1/token` | form `grant_type=refresh_token&refresh_token=…` |
| health | GET | `/` ou `/identity/v1` | — |

### Paths ERRADOS (não uses)

- ❌ `/__golive/auth/accounts:signInWithPassword` sem prefixo `identity/v1` *(pode funcionar por acaso; o SDK correcto usa `identity/v1`)*
- ❌ `/__golive/auth/v1/public/auth/signup` se `controlPlane` estiver mal (sem ser a base)
- ❌ `/api/auth/login`, `/auth/signup`, Supabase-style, Firebase REST inventado
- ❌ Chamar Google Identity Toolkit na cloud em dev local

### Fluxo recomendado no agente

1. `golive dev` com Auth no Dev Pack (painel `/__golive/` → Auth).
2. Ou criar user no **painel** (email/password) e só `signIn` na app.
3. Na app Vite: snippet acima com `endpoints` + `controlPlane: base`.
4. Testar: `signUp` → 200; `signIn` → 200; `getIdToken()` → JWT.

Utilizadores ficam em `.golive/dev/auth.json` (não commitar — pasta `.golive/`).

## Gerir (produção)

```bash
golive auth status
golive auth users ls
golive auth users add ana@app.ao secret123
golive auth users rm <uid>
golive auth disable
```

Dashboard → Autenticação. Facturação: 1000 MAU grátis, depois 100 Kz/MAU (PAYG).

## Checklist do agente

- [ ] Uso **só** `@golive/auth` (não fetch inventado)
- [ ] Em `golive dev`: `endpoints.identity`, `endpoints.secureToken`, `controlPlane` = base `/__golive/auth`
- [ ] `apiKey: "dev"`, `tenant: "dev"` em local
- [ ] Em prod: chaves do dashboard, **sem** `endpoints` (defaults cloud)
- [ ] Nunca hardcode `identitytoolkit.googleapis.com` no código da app do user
