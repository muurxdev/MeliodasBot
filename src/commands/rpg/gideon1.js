/**
 * Comando .gideon1 — Impacto do Martelo de Guerra Gideon (1): .gideon1
 * Categoria: rpg | Subcategoria: Tesouros Sagrados
 */

module.exports = {
    name: "gideon1",
    aliases: ["gid1","gid-1"],
    category: "rpg",
    subcategory: "Tesouros Sagrados",
    description: "Impacto do Martelo de Guerra Gideon (1): .gideon1",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🔨 *MARTELO DE GUERRA GIDEON*\n\nPesa uma tonelada e atrai o poder sísmico da terra com cada golpe.\n\n▫️ *Grau de Maestria:* Nível 1\n▫️ *Poder de Combate (CP):* +150 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.gideon1` para consultar lore e status.";
        return reply(doc);
    }
};
