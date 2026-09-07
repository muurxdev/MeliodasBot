/**
 * Comando .ark6 — Lança partículas purificadoras de Ark (6): .ark6
 * Categoria: rpg | Subcategoria: Magia das Deusas
 */

module.exports = {
    name: "ark6",
    aliases: ["holyark6","holyark-6"],
    category: "rpg",
    subcategory: "Magia das Deusas",
    description: "Lança partículas purificadoras de Ark (6): .ark6",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "✨ *ESFERA PURIFICADORA ARK*\n\nPartículas sagradas de luz que desintegram a escuridão em nível molecular.\n\n▫️ *Grau de Maestria:* Nível 6\n▫️ *Poder de Combate (CP):* +900 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.ark6` para consultar lore e status.";
        return reply(doc);
    }
};
