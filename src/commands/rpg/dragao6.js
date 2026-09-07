/**
 * Comando .dragao6 — Avistamento de Dragão Tirano de Britannia (6): .dragao6
 * Categoria: rpg | Subcategoria: Bestiário
 */

module.exports = {
    name: "dragao6",
    aliases: ["drag6","drag-6"],
    category: "rpg",
    subcategory: "Bestiário",
    description: "Avistamento de Dragão Tirano de Britannia (6): .dragao6",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🐉 *DRAGÃO TIRANO ANCESTRAL*\n\nBesta alada que domina os céus montanhosos de Danafor.\n\n▫️ *Grau de Maestria:* Nível 6\n▫️ *Poder de Combate (CP):* +900 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.dragao6` para consultar lore e status.";
        return reply(doc);
    }
};
