/**
 * Comando .forja8 — Trabalho de forja do mestre ferreiro Dubs (8): .forja8
 * Categoria: rpg | Subcategoria: Forja Sagrada
 */

module.exports = {
    name: "forja8",
    aliases: ["forge8","forge-8"],
    category: "rpg",
    subcategory: "Forja Sagrada",
    description: "Trabalho de forja do mestre ferreiro Dubs (8): .forja8",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "⚒️ *FORJA ANCESTRAL*\n\nTemperamento de metais celestes e ligas demoníacas para criação de armas.\n\n▫️ *Grau de Maestria:* Nível 8\n▫️ *Poder de Combate (CP):* +1200 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.forja8` para consultar lore e status.";
        return reply(doc);
    }
};
