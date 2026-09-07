/**
 * Comando .polen10 — Dispersa pólen curativo da Árvore Sagrada (10): .polen10
 * Categoria: rpg | Subcategoria: Magia das Fadas
 */

module.exports = {
    name: "polen10",
    aliases: ["pollen10","pollen-10"],
    category: "rpg",
    subcategory: "Magia das Fadas",
    description: "Dispersa pólen curativo da Árvore Sagrada (10): .polen10",
    cooldownMs: 1500,
    execute: async ({ reply, sender, prefix = '.' }) => {
        
        const doc = "🍃 *JARDIM DE PÓLEN*\n\nBarreira esférica que regenera a saúde e amortece impactos devastadores.\n\n▫️ *Grau de Maestria:* Nível 10\n▫️ *Poder de Combate (CP):* +1500 pts\n▫️ *Raridade:* Lendária 🌟\n▫️ *Ativação:* `.polen10` para consultar lore e status.";
        return reply(doc);
    }
};
