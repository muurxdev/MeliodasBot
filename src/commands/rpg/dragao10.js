/**
 * Comando .dragao10 — Avistamento de Dragão Tirano de Britannia (10): .dragao10
 * Categoria: rpg | Subcategoria: Bestiário
 */

module.exports = {
    name: "dragao10",
    aliases: [],
    category: "rpg",
    subcategory: "Bestiário",
    description: "Avistamento de Dragão Tirano de Britannia (10): .dragao10",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🐉 *DRAGÃO TIRANO ANCESTRAL*\n\nBesta alada que domina os céus montanhosos de Danafor.\n\n▫️ *Grau de Maestria:* Nível 10\n▫️ *Poder de Combate (CP):* +1500 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.dragao10` para consultar lore e status.";
        return reply(doc);
    }
};
