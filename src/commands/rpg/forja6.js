/**
 * Comando .forja6 — Trabalho de forja do mestre ferreiro Dubs (6): .forja6
 * Categoria: rpg | Subcategoria: Forja Sagrada
 */

module.exports = {
    name: "forja6",
    aliases: ["forge6","forge-6"],
    category: "rpg",
    subcategory: "Forja Sagrada",
    description: "Trabalho de forja do mestre ferreiro Dubs (6): .forja6",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "⚒️ *FORJA ANCESTRAL*\n\nTemperamento de metais celestes e ligas demoníacas para criação de armas.\n\n▫️ *Grau de Maestria:* Nível 6\n▫️ *Poder de Combate (CP):* +900 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.forja6` para consultar lore e status.";
        return reply(doc);
    }
};
