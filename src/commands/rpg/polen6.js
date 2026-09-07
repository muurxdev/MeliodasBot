/**
 * Comando .polen6 — Dispersa pólen curativo da Árvore Sagrada (6): .polen6
 * Categoria: rpg | Subcategoria: Magia das Fadas
 */

module.exports = {
    name: "polen6",
    aliases: [],
    category: "rpg",
    subcategory: "Magia das Fadas",
    description: "Dispersa pólen curativo da Árvore Sagrada (6): .polen6",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🍃 *JARDIM DE PÓLEN*\n\nBarreira esférica que regenera a saúde e amortece impactos devastadores.\n\n▫️ *Grau de Maestria:* Nível 6\n▫️ *Poder de Combate (CP):* +900 pts\n▫️ *Raridade:* Rara 💠\n▫️ *Ativação:* `.polen6` para consultar lore e status.";
        return reply(doc);
    }
};
