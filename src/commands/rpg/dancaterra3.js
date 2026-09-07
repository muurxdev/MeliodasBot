/**
 * Comando .dancaterra3 — Ritmo telúrico do Clã dos Gigantes (3): .dancaterra3
 * Categoria: rpg | Subcategoria: Dança dos Gigantes
 */

module.exports = {
    name: "dancaterra3",
    aliases: ["danca3","danca-3"],
    category: "rpg",
    subcategory: "Dança dos Gigantes",
    description: "Ritmo telúrico do Clã dos Gigantes (3): .dancaterra3",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🗿 *DANÇA DA TERRA (Drole Dance)*\n\nAumenta a afinidade com a mãe terra e eleva exponencialmente o nível de força (CP).\n\n▫️ *Grau de Maestria:* Nível 3\n▫️ *Poder de Combate (CP):* +450 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.dancaterra3` para consultar lore e status.";
        return reply(doc);
    }
};
