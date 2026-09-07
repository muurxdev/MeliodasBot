/**
 * Comando .polen3 — Dispersa pólen curativo da Árvore Sagrada (3): .polen3
 * Categoria: rpg | Subcategoria: Magia das Fadas
 */

module.exports = {
    name: "polen3",
    aliases: [],
    category: "rpg",
    subcategory: "Magia das Fadas",
    description: "Dispersa pólen curativo da Árvore Sagrada (3): .polen3",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🍃 *JARDIM DE PÓLEN*\n\nBarreira esférica que regenera a saúde e amortece impactos devastadores.\n\n▫️ *Grau de Maestria:* Nível 3\n▫️ *Poder de Combate (CP):* +450 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.polen3` para consultar lore e status.";
        return reply(doc);
    }
};
