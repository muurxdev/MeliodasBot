/**
 * Comando .dancaterra6 — Ritmo telúrico do Clã dos Gigantes (6): .dancaterra6
 * Categoria: rpg | Subcategoria: Dança dos Gigantes
 */

module.exports = {
    name: "dancaterra6",
    aliases: ["danca6","danca-6"],
    category: "rpg",
    subcategory: "Dança dos Gigantes",
    description: "Ritmo telúrico do Clã dos Gigantes (6): .dancaterra6",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🗿 *DANÇA DA TERRA (Drole Dance)*\n\nAumenta a afinidade com a mãe terra e eleva exponencialmente o nível de força (CP).\n\n▫️ *Grau de Maestria:* Nível 6\n▫️ *Poder de Combate (CP):* +900 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.dancaterra6` para consultar lore e status.";
        return reply(doc);
    }
};
