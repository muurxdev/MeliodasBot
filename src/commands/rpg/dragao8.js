/**
 * Comando .dragao8 — Avistamento de Dragão Tirano de Britannia (8): .dragao8
 * Categoria: rpg | Subcategoria: Bestiário
 */

module.exports = {
    name: "dragao8",
    aliases: ["drag8","drag-8"],
    category: "rpg",
    subcategory: "Bestiário",
    description: "Avistamento de Dragão Tirano de Britannia (8): .dragao8",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🐉 *DRAGÃO TIRANO ANCESTRAL*\n\nBesta alada que domina os céus montanhosos de Danafor.\n\n▫️ *Grau de Maestria:* Nível 8\n▫️ *Poder de Combate (CP):* +1200 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.dragao8` para consultar lore e status.";
        return reply(doc);
    }
};
