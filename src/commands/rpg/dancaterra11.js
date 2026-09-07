/**
 * Comando .dancaterra11 — Ritmo telúrico do Clã dos Gigantes (11): .dancaterra11
 * Categoria: rpg | Subcategoria: Dança dos Gigantes
 */

module.exports = {
    name: "dancaterra11",
    aliases: ["danca11","danca-11"],
    category: "rpg",
    subcategory: "Dança dos Gigantes",
    description: "Ritmo telúrico do Clã dos Gigantes (11): .dancaterra11",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🗿 *DANÇA DA TERRA (Drole Dance)*\n\nAumenta a afinidade com a mãe terra e eleva exponencialmente o nível de força (CP).\n\n▫️ *Grau de Maestria:* Nível 11\n▫️ *Poder de Combate (CP):* +1650 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.dancaterra11` para consultar lore e status.";
        return reply(doc);
    }
};
