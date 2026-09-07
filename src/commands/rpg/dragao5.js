/**
 * Comando .dragao5 — Avistamento de Dragão Tirano de Britannia (5): .dragao5
 * Categoria: rpg | Subcategoria: Bestiário
 */

module.exports = {
    name: "dragao5",
    aliases: [],
    category: "rpg",
    subcategory: "Bestiário",
    description: "Avistamento de Dragão Tirano de Britannia (5): .dragao5",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🐉 *DRAGÃO TIRANO ANCESTRAL*\n\nBesta alada que domina os céus montanhosos de Danafor.\n\n▫️ *Grau de Maestria:* Nível 5\n▫️ *Poder de Combate (CP):* +750 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.dragao5` para consultar lore e status.";
        return reply(doc);
    }
};
