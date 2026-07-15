---
name: golive-deploy
description: Publicar um projecto no GoLive — instalar a CLI, ligar a pasta, escolher o runtime (estático, edge functions, Node, Go, Next.js), fazer deploy para preview/produção, ligar o GitHub, e voltar atrás com rollback.
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
| Edge functions | pasta `functions/`, sem framework | Isolados V8 na borda (ver skill `golive-edge-functions`) |
| HTML estático | fallback | Estático (edge) |

Backends escutam `process.env.PORT` (Node) ou `$PORT` (Go).

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
golive env ls / pull         # listar / escrever um .env local
golive domains add exemplo.ao  # domínio próprio (cria um CNAME -> cname.golive.ao; SSL automático)
golive logs [--no-follow]    # build + runtime em directo
```

**Ideal para:** primeiro deploy, ligar CI por GitHub, ou automatizar publicações.

## Notas

- O plano **Free** dá 1 projecto estático. Domínios próprios, backends, edge
  functions, base de dados e auth exigem o plano **Pague por uso** (medido ao
  uso, facturado no dia 28 em Kz; requer NIF, sem cartão de crédito).
- Serviços por projecto (ver skills próprios): base de dados (`golive-database`),
  autenticação (`golive-auth`), armazenamento (`golive-storage`), edge functions
  (`golive-edge-functions`).
