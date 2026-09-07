/**
 * Comando .ark4 — Lança partículas purificadoras de Ark (4): .ark4
 * Categoria: rpg | Subcategoria: Magia das Deusas
 */

module.exports = {
    name: "ark4",
    aliases: ["holyark4","holyark-4"],
    category: "rpg",
    subcategory: "Magia das Deusas",
    description: "Lança partículas purificadoras de Ark (4): .ark4",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "✨ *ESFERA PURIFICADORA ARK*\n\nPartículas sagradas de luz que desintegram a escuridão em nível molecular.\n\n▫️ *Grau de Maestria:* Nível 4\n▫️ *Poder de Combate (CP):* +600 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.ark4` para consultar lore e status.";
        return reply(doc);
    }
};
