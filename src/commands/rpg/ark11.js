/**
 * Comando .ark11 — Lança partículas purificadoras de Ark (11): .ark11
 * Categoria: rpg | Subcategoria: Magia das Deusas
 */

module.exports = {
    name: "ark11",
    aliases: ["holyark11","holyark-11"],
    category: "rpg",
    subcategory: "Magia das Deusas",
    description: "Lança partículas purificadoras de Ark (11): .ark11",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "✨ *ESFERA PURIFICADORA ARK*\n\nPartículas sagradas de luz que desintegram a escuridão em nível molecular.\n\n▫️ *Grau de Maestria:* Nível 11\n▫️ *Poder de Combate (CP):* +1650 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.ark11` para consultar lore e status.";
        return reply(doc);
    }
};
