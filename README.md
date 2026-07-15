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

**`npx skills add`** (recomendado) — a [CLI da agentskills.io](https://github.com/vercel-labs/skills)
instala nos agentes que deteta (Claude Code, Cursor, Codex, Windsurf, Cline, …);
usa `-a <agente>` para escolher:

```bash
# todos os skills
npx skills add ithustle/golive-skills --all

# ou skills específicos
npx skills add ithustle/golive-skills --skill golive-deploy -y

# para um agente específico
npx skills add ithustle/golive-skills -a claude-code -a cursor
```

> **TM Code** ainda não é suportado pela CLI da Vercel (não tem alvo
> `.tms/skills/`) — instala-o pelo método manual.

**Manual** (TM Code, ou qualquer agente):

```bash
git clone https://github.com/ithustle/golive-skills.git

# TM Code: .tms/skills/ (global: ~/.toquemedia-studio/skills/)
cp -r golive-skills/skills/golive-deploy .tms/skills/

# Claude Code: .claude/skills/ (global: ~/.claude/skills/)
cp -r golive-skills/skills/golive-deploy .claude/skills/
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
