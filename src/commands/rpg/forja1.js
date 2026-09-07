/**
 * Comando .forja1 — Trabalho de forja do mestre ferreiro Dubs (1): .forja1
 * Categoria: rpg | Subcategoria: Forja Sagrada
 */

module.exports = {
    name: "forja1",
    aliases: [],
    category: "rpg",
    subcategory: "Forja Sagrada",
    description: "Trabalho de forja do mestre ferreiro Dubs (1): .forja1",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "⚒️ *FORJA ANCESTRAL*\n\nTemperamento de metais celestes e ligas demoníacas para criação de armas.\n\n▫️ *Grau de Maestria:* Nível 1\n▫️ *Poder de Combate (CP):* +150 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.forja1` para consultar lore e status.";
        return reply(doc);
    }
};
