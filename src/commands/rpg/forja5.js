/**
 * Comando .forja5 — Trabalho de forja do mestre ferreiro Dubs (5): .forja5
 * Categoria: rpg | Subcategoria: Forja Sagrada
 */

module.exports = {
    name: "forja5",
    aliases: [],
    category: "rpg",
    subcategory: "Forja Sagrada",
    description: "Trabalho de forja do mestre ferreiro Dubs (5): .forja5",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "⚒️ *FORJA ANCESTRAL*\n\nTemperamento de metais celestes e ligas demoníacas para criação de armas.\n\n▫️ *Grau de Maestria:* Nível 5\n▫️ *Poder de Combate (CP):* +750 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.forja5` para consultar lore e status.";
        return reply(doc);
    }
};
