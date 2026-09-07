/**
 * Comando .gideon9 — Impacto do Martelo de Guerra Gideon (9): .gideon9
 * Categoria: rpg | Subcategoria: Tesouros Sagrados
 */

module.exports = {
    name: "gideon9",
    aliases: ["gid9","gid-9"],
    category: "rpg",
    subcategory: "Tesouros Sagrados",
    description: "Impacto do Martelo de Guerra Gideon (9): .gideon9",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🔨 *MARTELO DE GUERRA GIDEON*\n\nPesa uma tonelada e atrai o poder sísmico da terra com cada golpe.\n\n▫️ *Grau de Maestria:* Nível 9\n▫️ *Poder de Combate (CP):* +1350 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.gideon9` para consultar lore e status.";
        return reply(doc);
    }
};
