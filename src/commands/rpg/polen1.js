/**
 * Comando .polen1 — Dispersa pólen curativo da Árvore Sagrada (1): .polen1
 * Categoria: rpg | Subcategoria: Magia das Fadas
 */

module.exports = {
    name: "polen1",
    aliases: ["pollen1","pollen-1"],
    category: "rpg",
    subcategory: "Magia das Fadas",
    description: "Dispersa pólen curativo da Árvore Sagrada (1): .polen1",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🍃 *JARDIM DE PÓLEN*\n\nBarreira esférica que regenera a saúde e amortece impactos devastadores.\n\n▫️ *Grau de Maestria:* Nível 1\n▫️ *Poder de Combate (CP):* +150 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.polen1` para consultar lore e status.";
        return reply(doc);
    }
};
