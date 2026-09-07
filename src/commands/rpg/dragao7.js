/**
 * Comando .dragao7 — Avistamento de Dragão Tirano de Britannia (7): .dragao7
 * Categoria: rpg | Subcategoria: Bestiário
 */

module.exports = {
    name: "dragao7",
    aliases: [],
    category: "rpg",
    subcategory: "Bestiário",
    description: "Avistamento de Dragão Tirano de Britannia (7): .dragao7",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🐉 *DRAGÃO TIRANO ANCESTRAL*\n\nBesta alada que domina os céus montanhosos de Danafor.\n\n▫️ *Grau de Maestria:* Nível 7\n▫️ *Poder de Combate (CP):* +1050 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.dragao7` para consultar lore e status.";
        return reply(doc);
    }
};
