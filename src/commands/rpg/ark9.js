/**
 * Comando .ark9 — Lança partículas purificadoras de Ark (9): .ark9
 * Categoria: rpg | Subcategoria: Magia das Deusas
 */

module.exports = {
    name: "ark9",
    aliases: [],
    category: "rpg",
    subcategory: "Magia das Deusas",
    description: "Lança partículas purificadoras de Ark (9): .ark9",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "✨ *ESFERA PURIFICADORA ARK*\n\nPartículas sagradas de luz que desintegram a escuridão em nível molecular.\n\n▫️ *Grau de Maestria:* Nível 9\n▫️ *Poder de Combate (CP):* +1350 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.ark9` para consultar lore e status.";
        return reply(doc);
    }
};
