/**
 * Comando .dancaterra9 — Ritmo telúrico do Clã dos Gigantes (9): .dancaterra9
 * Categoria: rpg | Subcategoria: Dança dos Gigantes
 */

module.exports = {
    name: "dancaterra9",
    aliases: ["danca9","danca-9"],
    category: "rpg",
    subcategory: "Dança dos Gigantes",
    description: "Ritmo telúrico do Clã dos Gigantes (9): .dancaterra9",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🗿 *DANÇA DA TERRA (Drole Dance)*\n\nAumenta a afinidade com a mãe terra e eleva exponencialmente o nível de força (CP).\n\n▫️ *Grau de Maestria:* Nível 9\n▫️ *Poder de Combate (CP):* +1350 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.dancaterra9` para consultar lore e status.";
        return reply(doc);
    }
};
