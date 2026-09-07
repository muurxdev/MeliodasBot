/**
 * Comando .forja7 — Trabalho de forja do mestre ferreiro Dubs (7): .forja7
 * Categoria: rpg | Subcategoria: Forja Sagrada
 */

module.exports = {
    name: "forja7",
    aliases: ["forge7","forge-7"],
    category: "rpg",
    subcategory: "Forja Sagrada",
    description: "Trabalho de forja do mestre ferreiro Dubs (7): .forja7",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "⚒️ *FORJA ANCESTRAL*\n\nTemperamento de metais celestes e ligas demoníacas para criação de armas.\n\n▫️ *Grau de Maestria:* Nível 7\n▫️ *Poder de Combate (CP):* +1050 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.forja7` para consultar lore e status.";
        return reply(doc);
    }
};
