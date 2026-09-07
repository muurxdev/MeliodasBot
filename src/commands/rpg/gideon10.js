/**
 * Comando .gideon10 — Impacto do Martelo de Guerra Gideon (10): .gideon10
 * Categoria: rpg | Subcategoria: Tesouros Sagrados
 */

module.exports = {
    name: "gideon10",
    aliases: ["gid10","gid-10"],
    category: "rpg",
    subcategory: "Tesouros Sagrados",
    description: "Impacto do Martelo de Guerra Gideon (10): .gideon10",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🔨 *MARTELO DE GUERRA GIDEON*\n\nPesa uma tonelada e atrai o poder sísmico da terra com cada golpe.\n\n▫️ *Grau de Maestria:* Nível 10\n▫️ *Poder de Combate (CP):* +1500 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.gideon10` para consultar lore e status.";
        return reply(doc);
    }
};
