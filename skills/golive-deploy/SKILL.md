---
name: golive-deploy
description: Publicar um projecto no GoLive — instalar a CLI, ligar a pasta, escolher o runtime (estático, edge functions, Node, Go, Next.js), fazer deploy para preview/produção, ligar o GitHub, e voltar atrás com rollback.
license: MIT
metadata:
  author: golive
  version: "1.3"
  language: pt
---

# GoLive — Deploy

Conhecimento para pôr um projecto no ar com a plataforma **GoLive** (PaaS,
cobrança em Kwanzas). Um projecto = uma app com subdomínio `<slug>.golive.ao` e
SSL automático.

## Instalar a CLI e ligar a pasta

```bash
npm install -g https://golive.co.ao/cli/golive-cli.tgz
golive login                 # abre o browser
golive init                  # liga a pasta a um projecto (escreve golive.json)
```

`golive.json` = `{ "projectId": "…" }`. Com ele presente, nenhum comando precisa
de `--project`. Todos os comandos aceitam `--json` (output para máquinas).

## Runtimes (detecção automática — sem configuração)

| Projecto | Detecção | Servido |
|---|---|---|
| React + Vite | `vite` nas deps | Estático (edge/CDN) |
| Next.js | `next` nas deps | SSR em contentor (ou estático com `next export`) |
| Node + Express | `express` nas deps | Contentor gerido |
| Go | `go.mod` na raiz | Contentor gerido |
| Edge functions | pasta `functions/` (sem app framework) | **Backend gerido** na borda + DB GoLive (ver `golive-edge-functions`) |
| HTML estático | fallback | Estático (edge) |

- **Edge** = API controlada pela plataforma (CORS, `DATABASE_URL` GoLive).
- **Backend** (Node/Go/Next) = mais controlo; DB GoLive **ou** a tua (Mongo, etc.). Escuta `process.env.PORT` / `$PORT`.

## Publicar

```bash
golive deploy                # pergunta produção/preview
golive deploy --preview      # versão de teste, sem tocar na produção
golive deploy --prod --yes   # produção, sem confirmação (CI)
```

Cada deploy é **imutável** e a activação é **atómica** (troca de tráfego sem
downtime). O exit code é ≠ 0 em falha.

## GitHub connect, rollback, env, domínios, logs

```bash
golive link --repo org/nome  # git push -> deploy automático (golive unlink desliga)
golive deploys               # histórico
golive rollback [deployId]   # volta ao deploy anterior (sem id: o último válido)
golive env set K=V           # var de ambiente (injectada no próximo deploy)
golive env file .env         # envia um .env inteiro de uma vez
golive env ls / pull         # listar / escrever um .env local
golive logs [--no-follow]    # build + runtime em directo
```

**Domínios próprios não têm comando na CLI** — configura-os no dashboard
(projecto → Domínios): cria um CNAME para `cname.golive.ao`, SSL automático.
Não existe `golive domains`.

**Ideal para:** primeiro deploy, ligar CI por GitHub, ou automatizar publicações.

## Notas

- **Free:** 1 site estático, 1 GB, 20 min build, Postgres 100 MB, Auth 100 users.
  **Sem** backends nem edge. **Pague por uso:** backends, edge, domínios, escala
  (facturado no dia 28; NIF).
- Escolha de runtime: API + **DB GoLive** → edge functions; stack livre / Mongo →
  backend. Skills: `golive-database`, `golive-edge-functions`, `golive-auth`,
  `golive-storage`.
