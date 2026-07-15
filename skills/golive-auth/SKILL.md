---
name: golive-auth
description: Adicionar autenticação de utilizadores à tua app com o auth gerido do GoLive — activar, usar o SDK @golive/auth no cliente (apiKey + tenant), gerir utilizadores, e a facturação por MAU.
license: MIT
metadata:
  author: golive
  version: "1.0"
  language: pt
---

# GoLive — Autenticação (MAU)

Login gerido (email/password) para a tua app. Os teus utilizadores ficam isolados
num tenant dedicado. Os primeiros **1000 utilizadores activos por mês** são
grátis; acima disso, **100 Kz/utilizador activo**. Requer o plano Pague por uso.

## Activar

```bash
golive auth enable
```

As chaves (`apiKey` + `tenant`) aparecem no separador **Autenticação → Integrar
no cliente** do teu projecto no dashboard.

## Cliente: SDK @golive/auth (sem dependências)

Instala a partir do GoLive (o registry npm não é usado):

```bash
npm i https://golive.co.ao/sdk/golive-auth.tgz
```

```js
import { GoLiveAuth } from "@golive/auth";

const auth = new GoLiveAuth({
  apiKey: "AIza…",   // chave pública do projecto
  tenant: "…",       // tenant de autenticação
});

await auth.signIn(email, password);          // ou signUp
const token = await auth.getIdToken();        // Authorization: Bearer <token>

auth.onChange((user) => console.log(user ? user.email : "sem sessão"));
```

Sem passo de build, também: `import { GoLiveAuth } from "https://golive.co.ao/sdk/auth.js"`.

Métodos: `signUp`, `signIn`, `signOut`, `getIdToken`, `sendPasswordReset`,
`updateProfile`, `onChange`, `currentUser`. A sessão é guardada e o token renova
sozinho (o utilizador só sai com `signOut()`). Erros são `GoLiveAuthError` com
`.code` estável e `.message` em português.

## Gerir utilizadores

Separador **Autenticação** no dashboard (criar, procurar, remover) ou pela CLI:

```bash
golive auth status               # activo? MAU do mês
golive auth users ls
golive auth users add ana@app.ao secret123
golive auth users rm <uid>
golive auth disable              # apaga o tenant e os utilizadores
```

**Ideal para:** adicionar login à tua app sem montares um serviço de auth.
