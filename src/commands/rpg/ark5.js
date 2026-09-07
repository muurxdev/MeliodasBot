/**
 * Comando .ark5 — Lança partículas purificadoras de Ark (5): .ark5
 * Categoria: rpg | Subcategoria: Magia das Deusas
 */

module.exports = {
    name: "ark5",
    aliases: [],
    category: "rpg",
    subcategory: "Magia das Deusas",
    description: "Lança partículas purificadoras de Ark (5): .ark5",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "✨ *ESFERA PURIFICADORA ARK*\n\nPartículas sagradas de luz que desintegram a escuridão em nível molecular.\n\n▫️ *Grau de Maestria:* Nível 5\n▫️ *Poder de Combate (CP):* +750 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.ark5` para consultar lore e status.";
        return reply(doc);
    }
};
