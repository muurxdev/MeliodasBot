/**
 * Comando .polen9 — Dispersa pólen curativo da Árvore Sagrada (9): .polen9
 * Categoria: rpg | Subcategoria: Magia das Fadas
 */

module.exports = {
    name: "polen9",
    aliases: [],
    category: "rpg",
    subcategory: "Magia das Fadas",
    description: "Dispersa pólen curativo da Árvore Sagrada (9): .polen9",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🍃 *JARDIM DE PÓLEN*\n\nBarreira esférica que regenera a saúde e amortece impactos devastadores.\n\n▫️ *Grau de Maestria:* Nível 9\n▫️ *Poder de Combate (CP):* +1350 pts\n▫️ *Raridade:* Comum ⚪\n▫️ *Ativação:* `.polen9` para consultar lore e status.";
        return reply(doc);
    }
};
