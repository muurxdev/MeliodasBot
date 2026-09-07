/**
 * Comando .gideon5 — Impacto do Martelo de Guerra Gideon (5): .gideon5
 * Categoria: rpg | Subcategoria: Tesouros Sagrados
 */

module.exports = {
    name: "gideon5",
    aliases: ["gid5","gid-5"],
    category: "rpg",
    subcategory: "Tesouros Sagrados",
    description: "Impacto do Martelo de Guerra Gideon (5): .gideon5",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🔨 *MARTELO DE GUERRA GIDEON*\n\nPesa uma tonelada e atrai o poder sísmico da terra com cada golpe.\n\n▫️ *Grau de Maestria:* Nível 5\n▫️ *Poder de Combate (CP):* +750 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.gideon5` para consultar lore e status.";
        return reply(doc);
    }
};
