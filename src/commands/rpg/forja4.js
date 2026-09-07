/**
 * Comando .forja4 — Trabalho de forja do mestre ferreiro Dubs (4): .forja4
 * Categoria: rpg | Subcategoria: Forja Sagrada
 */

module.exports = {
    name: "forja4",
    aliases: ["forge4","forge-4"],
    category: "rpg",
    subcategory: "Forja Sagrada",
    description: "Trabalho de forja do mestre ferreiro Dubs (4): .forja4",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "⚒️ *FORJA ANCESTRAL*\n\nTemperamento de metais celestes e ligas demoníacas para criação de armas.\n\n▫️ *Grau de Maestria:* Nível 4\n▫️ *Poder de Combate (CP):* +600 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.forja4` para consultar lore e status.";
        return reply(doc);
    }
};
