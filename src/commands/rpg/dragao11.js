/**
 * Comando .dragao11 — Avistamento de Dragão Tirano de Britannia (11): .dragao11
 * Categoria: rpg | Subcategoria: Bestiário
 */

module.exports = {
    name: "dragao11",
    aliases: ["drag11","drag-11"],
    category: "rpg",
    subcategory: "Bestiário",
    description: "Avistamento de Dragão Tirano de Britannia (11): .dragao11",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🐉 *DRAGÃO TIRANO ANCESTRAL*\n\nBesta alada que domina os céus montanhosos de Danafor.\n\n▫️ *Grau de Maestria:* Nível 11\n▫️ *Poder de Combate (CP):* +1650 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.dragao11` para consultar lore e status.";
        return reply(doc);
    }
};
