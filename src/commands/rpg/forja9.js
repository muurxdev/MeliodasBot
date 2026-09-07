/**
 * Comando .forja9 — Trabalho de forja do mestre ferreiro Dubs (9): .forja9
 * Categoria: rpg | Subcategoria: Forja Sagrada
 */

module.exports = {
    name: "forja9",
    aliases: [],
    category: "rpg",
    subcategory: "Forja Sagrada",
    description: "Trabalho de forja do mestre ferreiro Dubs (9): .forja9",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "⚒️ *FORJA ANCESTRAL*\n\nTemperamento de metais celestes e ligas demoníacas para criação de armas.\n\n▫️ *Grau de Maestria:* Nível 9\n▫️ *Poder de Combate (CP):* +1350 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.forja9` para consultar lore e status.";
        return reply(doc);
    }
};
