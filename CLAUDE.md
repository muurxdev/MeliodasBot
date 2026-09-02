# Daiki — convenções do repositório

Bot de WhatsApp (Baileys 7.0.0-rc11), Node.js **≥22.5** (usa `node:sqlite`), SQLite em `data/database.sqlite`. Entrada: `src/index.js`. ~718 arquivos de comando em `src/commands/<categoria>/`.

## Schema de um comando

Todo arquivo em `src/commands/**/*.js` exporta:

```js
module.exports = {
  name: 'nome',              // OBRIGATÓRIO, único no projeto inteiro
  execute: async (ctx) => {} // OBRIGATÓRIO
  aliases: ['a', 'b'],       // opcional; não pode colidir com nome nem outro alias
  category: 'admin',         // deve bater com a pasta
  subcategory: 'Moderação',  // opcional (usado pelo menu gerado)
  description: '...',
  cooldownMs: 3000,
  groupOnly, adminOnly, ownerOnly, botAdminOnly, minRole  // permissões
}
```

Permissão de admin-do-bot é **`botAdminOnly`**, não `botAdminRequired` (esse último nunca foi lido — não use).

## Regras de código

- **Nunca `catch (_) {}` vazio.** Sempre `logger.warn`/`logger.error` com contexto. Um catch vazio em `commandDispatcher.js` escondeu um `ReferenceError` por meses.
- **Statements SQL:** use o helper memoizado `q(sql)` de `src/database/connection.js`, não `getDatabase().prepare()` dentro de função (recompila a cada chamada).
- **Persistência de usuário:** `saveUser` usa `ON CONFLICT DO UPDATE`. Colunas fora do `SET` são preservadas de propósito (`created_at`, `vault_coins`). Para reduzir level/xp/mochila (rebirth, reset, penalidade), chame `saveUser(user, { force: true })`.
- **Hot path:** não chamar `getXpData()` (tabela inteira) no caminho de toda mensagem. Use `getUser(jid)` pontual.
- **Menu:** gerado do registro de comandos, não hardcoded. Comando novo aparece sozinho se tiver `category`/`subcategory`.

## Plano de recuperação em andamento

Ver `~/.claude/plans/a-partir-de-hoje-moonlit-falcon.md`. Fases 0-6; prioridade é bot funcionando sobre refatoração.
