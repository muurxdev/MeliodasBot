/**
 * Comando .dragao3 — Avistamento de Dragão Tirano de Britannia (3): .dragao3
 * Categoria: rpg | Subcategoria: Bestiário
 */

module.exports = {
    name: "dragao3",
    aliases: [],
    category: "rpg",
    subcategory: "Bestiário",
    description: "Avistamento de Dragão Tirano de Britannia (3): .dragao3",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🐉 *DRAGÃO TIRANO ANCESTRAL*\n\nBesta alada que domina os céus montanhosos de Danafor.\n\n▫️ *Grau de Maestria:* Nível 3\n▫️ *Poder de Combate (CP):* +450 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.dragao3` para consultar lore e status.";
        return reply(doc);
    }
};
