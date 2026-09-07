/**
 * Comando .forja3 — Trabalho de forja do mestre ferreiro Dubs (3): .forja3
 * Categoria: rpg | Subcategoria: Forja Sagrada
 */

module.exports = {
    name: "forja3",
    aliases: [],
    category: "rpg",
    subcategory: "Forja Sagrada",
    description: "Trabalho de forja do mestre ferreiro Dubs (3): .forja3",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "⚒️ *FORJA ANCESTRAL*\n\nTemperamento de metais celestes e ligas demoníacas para criação de armas.\n\n▫️ *Grau de Maestria:* Nível 3\n▫️ *Poder de Combate (CP):* +450 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.forja3` para consultar lore e status.";
        return reply(doc);
    }
};
