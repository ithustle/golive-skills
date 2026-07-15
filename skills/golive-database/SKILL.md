---
name: golive-database
description: Usar a base de dados Postgres gerida do GoLive — criar, ligar do backend com DATABASE_URL, explorar/editar dados no SGBD do dashboard, correr SQL pela CLI, e fazer backups agendáveis com restauro.
---

# GoLive — Base de dados (Postgres)

Cada projecto pode ter **uma** base de dados Postgres gerida. Requer o plano
Pague por uso.

## Criar e ligar

```bash
golive db create        # provisiona o Postgres
golive db info          # detalhes; golive db destroy apaga
```

No deploy seguinte o backend recebe `DATABASE_URL` no ambiente — liga-te com o
driver normal do teu stack:

```js
// Node — pg
import pg from "pg";
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();
const { rows } = await db.query("select * from clientes limit 10");
```

## SQL pela CLI

```bash
golive db query "select count(*) from pedidos"
cat schema.sql | golive db query        # também aceita SQL por stdin
```

## SGBD no dashboard

O separador **Base de dados** traz: navegador de tabelas, grelha de dados com
criar/editar/apagar linhas, vista de estrutura (colunas, índices, restrições),
um construtor de tabelas visual e um **editor SQL** com realce de sintaxe e
autocompletar.

## Backups & restauro

```bash
golive db backup create             # backup imediato
golive db backup schedule daily     # ou weekly / off
golive db backup ls
golive db backup restore <id>       # repõe os dados nesse ponto
```

Cada backup é uma cópia lógica completa (tabelas, dados, sequências, índices e
restrições), guardada comprimida. Retidos são cobrados como armazenamento
(**1.250 Kz/GB·mês**).

**Ideal para:** adicionar persistência a um backend, ou gerir/migrar o schema.
