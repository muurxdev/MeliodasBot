/**
 * Comando .forja10 — Trabalho de forja do mestre ferreiro Dubs (10): .forja10
 * Categoria: rpg | Subcategoria: Forja Sagrada
 */

module.exports = {
    name: "forja10",
    aliases: [],
    category: "rpg",
    subcategory: "Forja Sagrada",
    description: "Trabalho de forja do mestre ferreiro Dubs (10): .forja10",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "⚒️ *FORJA ANCESTRAL*\n\nTemperamento de metais celestes e ligas demoníacas para criação de armas.\n\n▫️ *Grau de Maestria:* Nível 10\n▫️ *Poder de Combate (CP):* +1500 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.forja10` para consultar lore e status.";
        return reply(doc);
    }
};
