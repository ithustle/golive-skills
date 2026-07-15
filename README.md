# GoLive — Agent Skills

Skills reutilizáveis que ensinam um agente de IA a **usar o [GoLive](https://golive.co.ao)**
— a PaaS para developers em Angola (deploy, Postgres, autenticação, armazenamento,
edge functions; cobrança em Kwanzas). Seguem a especificação aberta
[Agent Skills](https://agentskills.io) e funcionam com qualquer agente compatível.

## Agentes compatíveis

Claude Code, TM Code, OpenAI Codex, GitHub Copilot, Cursor, Cline, Gemini,
Windsurf — e qualquer agente que suporte a especificação
[agentskills.io](https://agentskills.io).

## Skills

| Skill | Descrição | Quando usar |
|-------|-----------|-------------|
| `golive-deploy` | Publicar um projecto (CLI, runtimes, preview/prod, GitHub, rollback) | Primeiro deploy, ligar CI, automatizar publicações |
| `golive-edge-functions` | Escrever edge functions (pasta `functions/`, TS→JS, contrato req/resposta) | APIs pequenas, webhooks, lógica na borda |
| `golive-database` | Postgres gerido: criar, ligar (`DATABASE_URL`), SGBD, backups | Adicionar persistência, gerir o schema |
| `golive-auth` | Autenticação de utilizadores (activar, SDK no cliente, gerir, MAU) | Adicionar login à app |
| `golive-storage` | Armazenamento de ficheiros (upload/download, links temporários) | Guardar assets ou uploads dos utilizadores |

## Instalação

**`npx ithustle/golive-skills`** (recomendado) — instalador próprio que cobre o
**Claude Code E o TM Code**, incluindo os alvos que a CLI da Vercel não suporta
(`.tms/skills` no projecto, `~/.toquemedia-studio/skills` global):

```bash
# no teu projecto → .claude/skills/ + .tms/skills/
npx ithustle/golive-skills

# global (todos os projectos) → ~/.claude/skills/ + ~/.toquemedia-studio/skills/
npx ithustle/golive-skills --global

# só algumas skills
npx ithustle/golive-skills --only golive-deploy,golive-auth
```

**`npx skills add`** — a [CLI da agentskills.io](https://github.com/vercel-labs/skills)
cobre outros agentes (Cursor, Codex, Windsurf, Cline, …), mas **não o TM Code**:

```bash
npx skills add ithustle/golive-skills -a claude-code -a cursor
```

**Manual** (qualquer agente) — copia a pasta da skill:

```bash
git clone https://github.com/ithustle/golive-skills.git
cp -r golive-skills/skills/golive-deploy .tms/skills/          # TM Code (projecto)
cp -r golive-skills/skills/golive-deploy .claude/skills/       # Claude Code
```

O agente deteta os skills automaticamente ao iniciar. Basta pedires *"faz deploy
do meu projecto no GoLive"* e o skill relevante é activado.

> **Segurança:** revê sempre o conteúdo do `SKILL.md` antes de instalar skills de
> terceiros — um skill pode instruir o agente a executar código e a aceder a
> ficheiros do sistema.

## Estrutura

```
skills/
  golive-deploy/SKILL.md
  golive-edge-functions/SKILL.md
  golive-database/SKILL.md
  golive-auth/SKILL.md
  golive-storage/SKILL.md
```

Documentação completa do GoLive: <https://golive.co.ao/docs>
