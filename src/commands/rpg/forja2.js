/**
 * Comando .forja2 — Trabalho de forja do mestre ferreiro Dubs (2): .forja2
 * Categoria: rpg | Subcategoria: Forja Sagrada
 */

module.exports = {
    name: "forja2",
    aliases: [],
    category: "rpg",
    subcategory: "Forja Sagrada",
    description: "Trabalho de forja do mestre ferreiro Dubs (2): .forja2",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "⚒️ *FORJA ANCESTRAL*\n\nTemperamento de metais celestes e ligas demoníacas para criação de armas.\n\n▫️ *Grau de Maestria:* Nível 2\n▫️ *Poder de Combate (CP):* +300 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.forja2` para consultar lore e status.";
        return reply(doc);
    }
};
