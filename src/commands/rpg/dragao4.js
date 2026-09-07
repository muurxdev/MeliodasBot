/**
 * Comando .dragao4 — Avistamento de Dragão Tirano de Britannia (4): .dragao4
 * Categoria: rpg | Subcategoria: Bestiário
 */

module.exports = {
    name: "dragao4",
    aliases: [],
    category: "rpg",
    subcategory: "Bestiário",
    description: "Avistamento de Dragão Tirano de Britannia (4): .dragao4",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🐉 *DRAGÃO TIRANO ANCESTRAL*\n\nBesta alada que domina os céus montanhosos de Danafor.\n\n▫️ *Grau de Maestria:* Nível 4\n▫️ *Poder de Combate (CP):* +600 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.dragao4` para consultar lore e status.";
        return reply(doc);
    }
};
