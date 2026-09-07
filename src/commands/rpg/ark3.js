/**
 * Comando .ark3 — Lança partículas purificadoras de Ark (3): .ark3
 * Categoria: rpg | Subcategoria: Magia das Deusas
 */

module.exports = {
    name: "ark3",
    aliases: [],
    category: "rpg",
    subcategory: "Magia das Deusas",
    description: "Lança partículas purificadoras de Ark (3): .ark3",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "✨ *ESFERA PURIFICADORA ARK*\n\nPartículas sagradas de luz que desintegram a escuridão em nível molecular.\n\n▫️ *Grau de Maestria:* Nível 3\n▫️ *Poder de Combate (CP):* +450 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.ark3` para consultar lore e status.";
        return reply(doc);
    }
};
