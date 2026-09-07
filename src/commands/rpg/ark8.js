/**
 * Comando .ark8 — Lança partículas purificadoras de Ark (8): .ark8
 * Categoria: rpg | Subcategoria: Magia das Deusas
 */

module.exports = {
    name: "ark8",
    aliases: ["holyark8","holyark-8"],
    category: "rpg",
    subcategory: "Magia das Deusas",
    description: "Lança partículas purificadoras de Ark (8): .ark8",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "✨ *ESFERA PURIFICADORA ARK*\n\nPartículas sagradas de luz que desintegram a escuridão em nível molecular.\n\n▫️ *Grau de Maestria:* Nível 8\n▫️ *Poder de Combate (CP):* +1200 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.ark8` para consultar lore e status.";
        return reply(doc);
    }
};
