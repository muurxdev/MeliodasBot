/**
 * Comando .gideon6 — Impacto do Martelo de Guerra Gideon (6): .gideon6
 * Categoria: rpg | Subcategoria: Tesouros Sagrados
 */

module.exports = {
    name: "gideon6",
    aliases: ["gid6","gid-6"],
    category: "rpg",
    subcategory: "Tesouros Sagrados",
    description: "Impacto do Martelo de Guerra Gideon (6): .gideon6",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🔨 *MARTELO DE GUERRA GIDEON*\n\nPesa uma tonelada e atrai o poder sísmico da terra com cada golpe.\n\n▫️ *Grau de Maestria:* Nível 6\n▫️ *Poder de Combate (CP):* +900 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.gideon6` para consultar lore e status.";
        return reply(doc);
    }
};
