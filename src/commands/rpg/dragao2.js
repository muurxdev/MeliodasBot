/**
 * Comando .dragao2 — Avistamento de Dragão Tirano de Britannia (2): .dragao2
 * Categoria: rpg | Subcategoria: Bestiário
 */

module.exports = {
    name: "dragao2",
    aliases: [],
    category: "rpg",
    subcategory: "Bestiário",
    description: "Avistamento de Dragão Tirano de Britannia (2): .dragao2",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🐉 *DRAGÃO TIRANO ANCESTRAL*\n\nBesta alada que domina os céus montanhosos de Danafor.\n\n▫️ *Grau de Maestria:* Nível 2\n▫️ *Poder de Combate (CP):* +300 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.dragao2` para consultar lore e status.";
        return reply(doc);
    }
};
