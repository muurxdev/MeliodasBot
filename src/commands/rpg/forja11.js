/**
 * Comando .forja11 — Trabalho de forja do mestre ferreiro Dubs (11): .forja11
 * Categoria: rpg | Subcategoria: Forja Sagrada
 */

module.exports = {
    name: "forja11",
    aliases: [],
    category: "rpg",
    subcategory: "Forja Sagrada",
    description: "Trabalho de forja do mestre ferreiro Dubs (11): .forja11",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "⚒️ *FORJA ANCESTRAL*\n\nTemperamento de metais celestes e ligas demoníacas para criação de armas.\n\n▫️ *Grau de Maestria:* Nível 11\n▫️ *Poder de Combate (CP):* +1650 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.forja11` para consultar lore e status.";
        return reply(doc);
    }
};
