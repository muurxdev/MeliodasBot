/**
 * Comando .polen7 — Dispersa pólen curativo da Árvore Sagrada (7): .polen7
 * Categoria: rpg | Subcategoria: Magia das Fadas
 */

module.exports = {
    name: "polen7",
    aliases: [],
    category: "rpg",
    subcategory: "Magia das Fadas",
    description: "Dispersa pólen curativo da Árvore Sagrada (7): .polen7",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🍃 *JARDIM DE PÓLEN*\n\nBarreira esférica que regenera a saúde e amortece impactos devastadores.\n\n▫️ *Grau de Maestria:* Nível 7\n▫️ *Poder de Combate (CP):* +1050 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.polen7` para consultar lore e status.";
        return reply(doc);
    }
};
