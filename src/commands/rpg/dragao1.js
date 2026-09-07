/**
 * Comando .dragao1 — Avistamento de Dragão Tirano de Britannia (1): .dragao1
 * Categoria: rpg | Subcategoria: Bestiário
 */

module.exports = {
    name: "dragao1",
    aliases: ["drag1","drag-1"],
    category: "rpg",
    subcategory: "Bestiário",
    description: "Avistamento de Dragão Tirano de Britannia (1): .dragao1",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🐉 *DRAGÃO TIRANO ANCESTRAL*\n\nBesta alada que domina os céus montanhosos de Danafor.\n\n▫️ *Grau de Maestria:* Nível 1\n▫️ *Poder de Combate (CP):* +150 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.dragao1` para consultar lore e status.";
        return reply(doc);
    }
};
