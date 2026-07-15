#!/usr/bin/env node
// Instalador das skills do GoLive — cobre também o TM Code, que a CLI da Vercel
// (`npx skills add`) NÃO suporta (não tem alvo .tms / .toquemedia-studio).
//
//   npx ithustle/golive-skills            # projecto: .claude/skills + .tms/skills
//   npx ithustle/golive-skills --global   # global:  ~/.claude/skills + ~/.toquemedia-studio/skills
//   npx ithustle/golive-skills --only golive-deploy,golive-auth
import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = join(here, "..", "skills");

const args = process.argv.slice(2);
const isGlobal = args.includes("--global") || args.includes("-g");
const onlyArg = args[args.indexOf("--only") + 1];
const only = args.includes("--only") && onlyArg ? new Set(onlyArg.split(",")) : null;

const all = readdirSync(SKILLS_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(SKILLS_DIR, d.name, "SKILL.md")))
  .map((d) => d.name);
const skills = only ? all.filter((n) => only.has(n)) : all;

if (skills.length === 0) {
  console.error("Nenhuma skill para instalar.");
  process.exit(1);
}

// Destinos por agente. TM Code é o que a CLI da Vercel não cobre:
//  - projecto: .tms/skills  (o TM Code também lê .toquemedia-studio/skills)
//  - global:   ~/.toquemedia-studio/skills
const targets = isGlobal
  ? [
      ["Claude Code (global)", join(homedir(), ".claude", "skills")],
      ["TM Code (global)", join(homedir(), ".toquemedia-studio", "skills")],
    ]
  : [
      ["Claude Code (projecto)", join(process.cwd(), ".claude", "skills")],
      ["TM Code (projecto)", join(process.cwd(), ".tms", "skills")],
    ];

for (const [label, dir] of targets) {
  mkdirSync(dir, { recursive: true });
  for (const name of skills) {
    cpSync(join(SKILLS_DIR, name), join(dir, name), { recursive: true });
  }
  console.log(`✔ ${skills.length} skill(s) → ${label}\n  ${dir}`);
}
console.log(`\nSkills: ${skills.join(", ")}`);
console.log(isGlobal ? "" : "Dica: usa --global para instalar para todos os projectos.");
