/**
 * Comando .dancaterra8 — Ritmo telúrico do Clã dos Gigantes (8): .dancaterra8
 * Categoria: rpg | Subcategoria: Dança dos Gigantes
 */

module.exports = {
    name: "dancaterra8",
    aliases: ["danca8","danca-8"],
    category: "rpg",
    subcategory: "Dança dos Gigantes",
    description: "Ritmo telúrico do Clã dos Gigantes (8): .dancaterra8",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🗿 *DANÇA DA TERRA (Drole Dance)*\n\nAumenta a afinidade com a mãe terra e eleva exponencialmente o nível de força (CP).\n\n▫️ *Grau de Maestria:* Nível 8\n▫️ *Poder de Combate (CP):* +1200 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.dancaterra8` para consultar lore e status.";
        return reply(doc);
    }
};
