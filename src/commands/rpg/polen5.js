/**
 * Comando .polen5 — Dispersa pólen curativo da Árvore Sagrada (5): .polen5
 * Categoria: rpg | Subcategoria: Magia das Fadas
 */

module.exports = {
    name: "polen5",
    aliases: ["pollen5","pollen-5"],
    category: "rpg",
    subcategory: "Magia das Fadas",
    description: "Dispersa pólen curativo da Árvore Sagrada (5): .polen5",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🍃 *JARDIM DE PÓLEN*\n\nBarreira esférica que regenera a saúde e amortece impactos devastadores.\n\n▫️ *Grau de Maestria:* Nível 5\n▫️ *Poder de Combate (CP):* +750 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.polen5` para consultar lore e status.";
        return reply(doc);
    }
};
