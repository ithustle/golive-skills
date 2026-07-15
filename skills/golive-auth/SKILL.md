---
name: golive-auth
description: Adicionar autenticação de utilizadores à tua app com o auth gerido do GoLive — activar, inicializar o SDK no cliente com as chaves GOLIVE_AUTH_*, gerir utilizadores, e a facturação por MAU.
---

# GoLive — Autenticação (MAU)

Login gerido (email/password) para a tua app. Os teus utilizadores ficam isolados
num tenant dedicado. Os primeiros **1000 utilizadores activos por mês** são
grátis; acima disso, **100 Kz/utilizador activo**. Requer o plano Pague por uso.

## Activar

```bash
golive auth enable
```

Ao activar, o backend recebe as chaves `GOLIVE_AUTH_*` no ambiente:
`GOLIVE_AUTH_TENANT_ID`, `GOLIVE_AUTH_API_KEY`, `GOLIVE_AUTH_DOMAIN`,
`GOLIVE_AUTH_PROJECT_ID`.

## Inicializar no cliente (web/mobile)

Usa o SDK do Firebase Auth com o `tenantId` — a config aparece no dashboard:

```js
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const app = initializeApp({
  apiKey: GOLIVE_AUTH_API_KEY,
  authDomain: GOLIVE_AUTH_DOMAIN,
  projectId: GOLIVE_AUTH_PROJECT_ID,
});
const auth = getAuth(app);
auth.tenantId = GOLIVE_AUTH_TENANT_ID;

await signInWithEmailAndPassword(auth, email, password);
```

## Gerir utilizadores

Separador **Autenticação** no dashboard (criar, procurar, remover — consola
estilo Firebase) ou pela CLI:

```bash
golive auth status               # activo? MAU do mês
golive auth users ls
golive auth users add ana@app.ao secret123
golive auth users rm <uid>
golive auth disable              # apaga o tenant e os utilizadores
```

**Ideal para:** adicionar login à tua app sem montares um serviço de auth.
