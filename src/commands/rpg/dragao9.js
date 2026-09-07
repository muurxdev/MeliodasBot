/**
 * Comando .dragao9 — Avistamento de Dragão Tirano de Britannia (9): .dragao9
 * Categoria: rpg | Subcategoria: Bestiário
 */

module.exports = {
    name: "dragao9",
    aliases: ["drag9","drag-9"],
    category: "rpg",
    subcategory: "Bestiário",
    description: "Avistamento de Dragão Tirano de Britannia (9): .dragao9",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🐉 *DRAGÃO TIRANO ANCESTRAL*\n\nBesta alada que domina os céus montanhosos de Danafor.\n\n▫️ *Grau de Maestria:* Nível 9\n▫️ *Poder de Combate (CP):* +1350 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.dragao9` para consultar lore e status.";
        return reply(doc);
    }
};
